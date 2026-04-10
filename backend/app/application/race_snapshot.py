from __future__ import annotations

import asyncio
import logging
from typing import Any

from app.core.domain import DomainPayload
from app.domains.event.service import EventService
from app.domains.lap.service import LapService
from app.domains.position.service import PositionService
from app.domains.session.service import SessionService
from app.domains.weather.service import WeatherService

logger = logging.getLogger(__name__)


class RaceSnapshotService:
    def __init__(self):
        self.session_service = SessionService()
        self.position_service = PositionService()
        self.lap_service = LapService()
        self.weather_service = WeatherService()
        self.event_service = EventService()

    async def build_snapshot(self, session_key: int | str | None = None) -> dict[str, Any]:
        session_payload = await self.session_service.resolve_session(session_key)
        session = session_payload.data or {}
        actual_session_key = session.get("session_key")

        if actual_session_key is None:
            return self._empty_snapshot(session_payload)

        drivers_payload = await self.session_service.get_drivers(actual_session_key)
        stints_payload = await self.lap_service.get_stints(actual_session_key)

        results = await asyncio.gather(
            self.position_service.get(
                actual_session_key,
                drivers_payload.data,
                stints_payload.data,
            ),
            self.lap_service.get(actual_session_key),
            self.weather_service.get(actual_session_key),
            self.event_service.get(actual_session_key, drivers_payload.data),
            return_exceptions=True,
        )

        position_payload = self._coerce_result(results[0], [])
        lap_payload = self._coerce_result(results[1], None)
        weather_payload = self._coerce_result(results[2], None)
        event_payload = self._coerce_result(results[3], [])

        domains = {
            "session": self._domain_meta(session_payload),
            "drivers": self._domain_meta(drivers_payload),
            "stints": self._domain_meta(stints_payload),
            "position": self._domain_meta(position_payload),
            "lap": self._domain_meta(lap_payload),
            "weather": self._domain_meta(weather_payload),
            "event": self._domain_meta(event_payload),
        }

        return {
            "session": {
                "session_key": actual_session_key,
                "meeting_name": session.get("meeting_name"),
                "session_name": session.get("session_name"),
                "location": session.get("location"),
                "country_name": session.get("country_name"),
                "circuit_short_name": session.get("circuit_short_name"),
            },
            "positions": position_payload.data,
            "lap": lap_payload.data,
            "weather": weather_payload.data,
            "highlights": event_payload.data,
            "domains": domains,
        }

    def _coerce_result(self, result: Any, fallback: Any) -> DomainPayload[Any]:
        if isinstance(result, DomainPayload):
            return result
        if isinstance(result, Exception):
            logger.error(
                "Domain gather failure: %s",
                result,
                exc_info=(type(result), result, result.__traceback__),
            )
            return DomainPayload.degraded(fallback, str(result))
        return DomainPayload.ok(result)

    def _domain_meta(self, payload: DomainPayload[Any]) -> dict[str, Any]:
        return {
            "status": payload.status,
            "errors": payload.errors,
            "updated_at": payload.updated_at,
        }

    def _empty_snapshot(self, session_payload: DomainPayload[Any]) -> dict[str, Any]:
        return {
            "session": None,
            "positions": [],
            "lap": None,
            "weather": None,
            "highlights": [],
            "domains": {
                "session": self._domain_meta(session_payload),
            },
        }


race_snapshot_service = RaceSnapshotService()
