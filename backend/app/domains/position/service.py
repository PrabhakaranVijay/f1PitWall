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
        item_date = item.get("date", "")
        if item_key is None:
            continue
        if item_key not in latest or item_date > latest[item_key].get("date", ""):
            latest[item_key] = item

    return latest


def _format_gap(value: Any, position: int) -> str:
    if position == 1:
        return "Leader"
    if value in (None, "", 0, "0", 0.0):
        return "+"
    if isinstance(value, (float, int)):
        return f"+{value:.3f}"
    value_str = str(value)
    return value_str if value_str.startswith("+") else f"+{value_str}"


class PositionService:
    def __init__(self, client: OpenF1Client | None = None):
        self._client = client or openf1_client
        self._cache: TTLCache[list[dict[str, Any]]] = TTLCache()

    async def get(
        self,
        session_key: int,
        drivers: dict[int, dict[str, Any]],
        stints: dict[int, dict[str, Any]] | None = None,
    ) -> DomainPayload[list[dict[str, Any]]]:
        cache_key = f"position:{session_key}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            positions = await self._client.get("position", {"session_key": session_key})
            intervals = await self._client.get("intervals", {"session_key": session_key})

            latest_positions = _latest_by(positions, "driver_number")
            latest_intervals = _latest_by(intervals, "driver_number")
            latest_stints = stints or {}

            leaderboard: list[dict[str, Any]] = []
            for driver_number, position_row in latest_positions.items():
                driver = drivers.get(driver_number, {})
                interval = latest_intervals.get(driver_number, {})
                stint = latest_stints.get(driver_number, {})
                position_value = position_row.get("position") or 0
                compound = stint.get("compound") or ""

                leaderboard.append(
                    {
                        "num": driver_number,
                        "name": driver.get("name_acronym", "UNK"),
                        "team": driver.get("team_name", ""),
                        "teamColor": f"#{driver.get('team_colour', '3B82F6')}",
                        "pos": position_value,
                        "gap": _format_gap(interval.get("gap_to_leader"), position_value),
                        "tir": compound[:1] if compound else "-",
                    }
                )

            leaderboard.sort(key=lambda item: item["pos"])
            await self._cache.set(
                cache_key,
                leaderboard,
                settings.POSITION_CACHE_TTL_SECONDS,
            )
            return DomainPayload.ok(leaderboard)
        except Exception as exc:
            logger.exception("Position domain failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(data=cached, status="stale", errors=[str(exc)])
            return DomainPayload.degraded([], str(exc))
