from __future__ import annotations

import logging
from typing import Any

from app.config import settings
from app.core.cache import TTLCache
from app.core.domain import DomainPayload
from app.infrastructure.openf1_client import OpenF1Client, openf1_client

logger = logging.getLogger(__name__)


def _latest_by(items: list[dict[str, Any]], key: str) -> dict[Any, dict[str, Any]]:
    latest: dict[Any, dict[str, Any]] = {}
    for item in items:
        item_key = item.get(key)
        if item_key is None:
            continue

        item_date = item.get("date_start") or item.get("date") or ""
        previous = latest.get(item_key)
        previous_date = (previous or {}).get("date_start") or (previous or {}).get("date") or ""
        if previous is None or item_date > previous_date:
            latest[item_key] = item
    return latest


def _latest_stints(stints: list[dict[str, Any]]) -> dict[int, dict[str, Any]]:
    latest: dict[int, dict[str, Any]] = {}
    for stint in stints:
        driver_number = stint.get("driver_number")
        if driver_number is None:
            continue

        previous = latest.get(driver_number)
        candidate_key = (stint.get("stint_number", 0), stint.get("lap_end", 0))
        previous_key = (
            (previous or {}).get("stint_number", 0),
            (previous or {}).get("lap_end", 0),
        )
        if previous is None or candidate_key >= previous_key:
            latest[driver_number] = stint
    return latest


def _format_lap_time(seconds: Any) -> str | None:
    if seconds in (None, "", 0):
        return None
    try:
        total_seconds = float(seconds)
    except (TypeError, ValueError):
        return None
    minutes = int(total_seconds // 60)
    remaining = total_seconds - minutes * 60
    return f"{minutes}:{remaining:06.3f}"


class LapService:
    def __init__(self, client: OpenF1Client | None = None):
        self._client = client or openf1_client
        self._cache: TTLCache[dict[str, Any]] = TTLCache()
        self._stint_cache: TTLCache[dict[int, dict[str, Any]]] = TTLCache()

    async def get_stints(self, session_key: int) -> DomainPayload[dict[int, dict[str, Any]]]:
        cache_key = f"stints:{session_key}"
        cached = await self._stint_cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            stints = await self._client.get("stints", {"session_key": session_key})
            latest_stint_map = _latest_stints(stints)
            await self._stint_cache.set(
                cache_key,
                latest_stint_map,
                settings.LAP_CACHE_TTL_SECONDS,
            )
            return DomainPayload.ok(latest_stint_map)
        except Exception as exc:
            logger.exception("Stint domain failed for session=%s", session_key)
            cached = await self._stint_cache.get(cache_key)
            if cached is not None:
                return DomainPayload(data=cached, status="stale", errors=[str(exc)])
            return DomainPayload.degraded({}, str(exc))

    async def get(self, session_key: int) -> DomainPayload[dict[str, Any] | None]:
        cache_key = f"laps:{session_key}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            laps = await self._client.get("laps", {"session_key": session_key})
            if not laps:
                return DomainPayload.degraded(None, "No lap data available")

            latest_laps = _latest_by(laps, "driver_number")
            lap_rows = list(latest_laps.values())
            if not lap_rows:
                return DomainPayload.degraded(None, "No latest lap rows available")

            current_lap = max((row.get("lap_number") or 0) for row in lap_rows)
            valid_laps = [
                row.get("lap_duration")
                for row in lap_rows
                if row.get("lap_duration") not in (None, 0)
                and row.get("is_pit_out_lap") is not True
            ]
            leader_lap = next(
                (
                    row
                    for row in lap_rows
                    if row.get("lap_number") == current_lap
                    and row.get("is_pit_out_lap") is not True
                ),
                None,
            )

            lap_panel = {
                "current_lap": current_lap,
                "total_laps": max(current_lap, 1),
                "lap_progress": 0,
                "fastest_lap": _format_lap_time(min(valid_laps)) if valid_laps else None,
                "last_lap": _format_lap_time((leader_lap or {}).get("lap_duration")),
            }

            await self._cache.set(
                cache_key,
                lap_panel,
                settings.LAP_CACHE_TTL_SECONDS,
            )
            return DomainPayload.ok(lap_panel)
        except Exception as exc:
            logger.exception("Lap domain failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(data=cached, status="stale", errors=[str(exc)])
            return DomainPayload.degraded(None, str(exc))
