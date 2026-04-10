from __future__ import annotations

import logging
import time
from datetime import datetime, timezone

from app.config import settings
from app.core.cache import TTLCache
from app.core.domain import DomainPayload
from app.infrastructure.openf1_client import OpenF1Client, openf1_client

logger = logging.getLogger(__name__)


def _to_timestamp(value: str | None) -> int:
    if not value:
        return int(datetime.now(timezone.utc).timestamp() * 1000)
    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return int(parsed.timestamp() * 1000)


def _event_type(category: str | None, message: str | None) -> str:
    category_value = (category or "").lower()
    message_value = (message or "").lower()
    if "safety" in category_value or "safety car" in message_value:
        return "safety_car"
    if "flag" in category_value:
        return "flag"
    if "penalty" in message_value:
        return "penalty"
    if "retire" in message_value:
        return "retirement"
    if "drs" in message_value or "drs" in category_value:
        return "drs"
    return "flag"


class EventService:
    def __init__(self, client: OpenF1Client | None = None):
        self._client = client or openf1_client
        self._cache: TTLCache[list[dict]] = TTLCache()
        self._disabled_until: dict[str, float] = {}

    def _endpoint_enabled(self, endpoint: str) -> bool:
        return self._disabled_until.get(endpoint, 0) <= time.monotonic()

    def _disable_endpoint(self, endpoint: str):
        self._disabled_until[endpoint] = (
            time.monotonic() + settings.UNSTABLE_ENDPOINT_COOLDOWN_SECONDS
        )

    async def _safe_endpoint(
        self,
        endpoint: str,
        session_key: int,
    ) -> list[dict]:
        if not self._endpoint_enabled(endpoint):
            return []

        try:
            return await self._client.get(
                endpoint,
                {"session_key": session_key},
                allow_404=True,
            )
        except Exception as exc:
            logger.warning("Event endpoint %s failed: %s", endpoint, exc)
            self._disable_endpoint(endpoint)
            return []

    async def get(
        self,
        session_key: int,
        drivers: dict[int, dict],
    ) -> DomainPayload[list[dict]]:
        cache_key = f"events:{session_key}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        errors: list[str] = []
        try:
            overtakes = await self._safe_endpoint("overtakes", session_key)
            race_control = await self._safe_endpoint("race_control", session_key)

            events: list[dict] = []
            for overtake in overtakes[-5:]:
                attacker = drivers.get(overtake.get("overtaking_driver_number"), {})
                defender = drivers.get(overtake.get("overtaken_driver_number"), {})
                position = overtake.get("position")
                events.append(
                    {
                        "id": f"overtake-{overtake.get('date')}-{overtake.get('overtaking_driver_number')}",
                        "type": "overtake",
                        "message": (
                            f"{attacker.get('name_acronym', overtake.get('overtaking_driver_number'))} "
                            f"overtook {defender.get('name_acronym', overtake.get('overtaken_driver_number'))}"
                            f"{f' for P{position}' if position else ''}"
                        ),
                        "timestamp": _to_timestamp(overtake.get("date")),
                    }
                )

            for control in race_control[-8:]:
                events.append(
                    {
                        "id": f"control-{control.get('date')}-{control.get('category')}",
                        "type": _event_type(control.get("category"), control.get("message")),
                        "message": control.get("message")
                        or control.get("category")
                        or "Race control",
                        "timestamp": _to_timestamp(control.get("date")),
                    }
                )

            events.sort(key=lambda item: item["timestamp"], reverse=True)
            events = events[:10]

            await self._cache.set(
                cache_key,
                events,
                settings.EVENT_CACHE_TTL_SECONDS,
            )

            if not overtakes and not self._endpoint_enabled("overtakes"):
                errors.append("Overtakes endpoint temporarily disabled")
            if not race_control and not self._endpoint_enabled("race_control"):
                errors.append("Race control endpoint temporarily disabled")

            if errors:
                return DomainPayload(data=events, status="degraded", errors=errors)
            return DomainPayload.ok(events)
        except Exception as exc:
            logger.exception("Event domain failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(data=cached, status="stale", errors=[str(exc)])
            return DomainPayload.degraded([], str(exc))
