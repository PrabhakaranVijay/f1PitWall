from __future__ import annotations

import logging
from typing import Any

from app.config import settings
from app.core.cache import TTLCache
from app.core.domain import DomainPayload
from app.infrastructure.openf1_client import OpenF1Client, openf1_client

logger = logging.getLogger(__name__)


class SessionService:
    def __init__(self, client: OpenF1Client | None = None):
        self._client = client or openf1_client
        self._cache: TTLCache[dict[str, Any]] = TTLCache()

    async def resolve_session(
        self,
        session_key: int | str | None = None,
    ) -> DomainPayload[dict[str, Any] | None]:
        cache_key = f"session:{session_key or 'latest'}"

        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            if session_key in (None, "latest"):
                sessions = await self._client.get(
                    "sessions",
                    {"session_type": "Race"},
                )
                if not sessions:
                    return DomainPayload.degraded(None, "No race session available")

                session = sorted(
                    sessions,
                    key=lambda item: item.get("date_start", ""),
                    reverse=True,
                )[0]
            else:
                sessions = await self._client.get(
                    "sessions",
                    {"session_key": session_key},
                )
                session = sessions[0] if sessions else None

            if session is None:
                return DomainPayload.degraded(None, f"Session {session_key} not found")

            await self._cache.set(
                cache_key,
                session,
                settings.SESSION_CACHE_TTL_SECONDS,
            )

            return DomainPayload.ok(session)
        except Exception as exc:
            logger.exception("Session domain failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(
                    data=cached,
                    status="stale",
                    errors=[str(exc)],
                )

            return DomainPayload.degraded(None, str(exc))

    async def get_drivers(self, session_key: int) -> DomainPayload[dict[int, dict[str, Any]]]:
        cache_key = f"drivers:{session_key}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            drivers = await self._client.get("drivers", {"session_key": session_key})
            driver_map = {driver["driver_number"]: driver for driver in drivers}
            await self._cache.set(
                cache_key,
                driver_map,
                settings.SESSION_CACHE_TTL_SECONDS,
            )
            return DomainPayload.ok(driver_map)
        except Exception as exc:
            logger.exception("Driver lookup failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(
                    data=cached,
                    status="stale",
                    errors=[str(exc)],
                )
            return DomainPayload.degraded({}, str(exc))
