from __future__ import annotations

import asyncio
from datetime import datetime, timezone
from typing import Any

from app.services.openf1 import (
    get_drivers,
    get_intervals,
    get_laps,
    get_overtakes,
    get_pit,
    get_positions,
    get_race_control,
    get_session,
    get_stints,
    get_weather,
    resolve_session,
)

drivers_cache: dict[int, dict[int, dict[str, Any]]] = {}


def _latest_by(items: list[dict[str, Any]], key: str):
    latest: dict[Any, dict[str, Any]] = {}

    for item in items:
        item_key = item.get(key)
        item_date = item.get("date", "")
        if item_key is None:
            continue

        if item_key not in latest or item_date > latest[item_key].get("date", ""):
            latest[item_key] = item

    return latest


def _latest_stints(stints: list[dict[str, Any]]):
    latest: dict[int, dict[str, Any]] = {}

    for stint in stints:
        driver_number = stint.get("driver_number")
        stint_number = stint.get("stint_number", 0)
        lap_end = stint.get("lap_end", 0)
        if driver_number is None:
            continue

        previous = latest.get(driver_number)
        if previous is None:
            latest[driver_number] = stint
            continue

        if (stint_number, lap_end) >= (
            previous.get("stint_number", 0),
            previous.get("lap_end", 0),
        ):
            latest[driver_number] = stint

    return latest


def _format_gap(value: Any, fallback_position: int) -> str:
    if fallback_position == 1:
        return "Leader"

    if value in (None, "", 0, "0", 0.0):
        return "+"

    if isinstance(value, (int, float)):
        return f"+{value:.3f}"

    value_str = str(value)
    if value_str.startswith("+") or "LAP" in value_str.upper():
        return value_str

    return f"+{value_str}"


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


def _event_type_from_race_control(category: str | None, message: str | None):
    category_value = (category or "").lower()
    message_value = (message or "").lower()

    if "safety" in category_value or "safety car" in message_value:
        return "safety_car"
    if "flag" in category_value:
        return "flag"
    if "drs" in category_value:
        return "drs"
    if "penalty" in message_value:
        return "penalty"
    if "retire" in message_value:
        return "retirement"

    return "flag"


def _to_timestamp(value: str | None) -> int:
    if not value:
        return int(datetime.now(tz=timezone.utc).timestamp() * 1000)

    parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    return int(parsed.timestamp() * 1000)


async def _get_drivers_map(session_key: int):
    cached = drivers_cache.get(session_key)
    if cached:
        return cached

    drivers = await get_drivers(session_key)
    driver_map = {driver["driver_number"]: driver for driver in drivers}
    drivers_cache[session_key] = driver_map
    return driver_map


async def build_leaderboard(session_key: int):
    positions, intervals, stints, driver_map = await asyncio.gather(
        get_positions(session_key),
        get_intervals(session_key),
        get_stints(session_key),
        _get_drivers_map(session_key),
    )

    latest_positions = _latest_by(positions, "driver_number")
    latest_intervals = _latest_by(intervals, "driver_number")
    latest_stint_map = _latest_stints(stints)

    leaderboard = []

    for driver_number, position_row in latest_positions.items():
        driver = driver_map.get(driver_number, {})
        interval = latest_intervals.get(driver_number, {})
        stint = latest_stint_map.get(driver_number, {})
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
    return leaderboard


async def build_lap_panel(session_key: int):
    laps = await get_laps(session_key)
    if not laps:
        return None

    latest_laps = _latest_by(laps, "driver_number")
    lap_rows = list(latest_laps.values())
    if not lap_rows:
        return None

    current_lap = max((row.get("lap_number") or 0) for row in lap_rows)
    leader_lap = next(
        (
            row
            for row in lap_rows
            if row.get("lap_number") == current_lap and row.get("is_pit_out_lap") is not True
        ),
        None,
    )

    valid_laps = [
        row.get("lap_duration")
        for row in lap_rows
        if row.get("lap_duration") not in (None, 0) and row.get("is_pit_out_lap") is not True
    ]

    lap_progress = (current_lap % 1) if isinstance(current_lap, float) else 0

    return {
        "current_lap": current_lap,
        "total_laps": max(current_lap, 1),
        "lap_progress": lap_progress,
        "fastest_lap": _format_lap_time(min(valid_laps)) if valid_laps else None,
        "last_lap": _format_lap_time(leader_lap.get("lap_duration")) if leader_lap else None,
    }


async def build_highlights(session_key: int):
    overtakes, race_control, pit, driver_map = await asyncio.gather(
        get_overtakes(session_key),
        get_race_control(session_key),
        get_pit(session_key),
        _get_drivers_map(session_key),
    )

    events = []

    for overtake in overtakes[-5:]:
        attacker = driver_map.get(overtake.get("overtaking_driver_number"), {})
        defender = driver_map.get(overtake.get("overtaken_driver_number"), {})
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

    for stop in pit[-5:]:
        driver = driver_map.get(stop.get("driver_number"), {})
        stop_duration = stop.get("stop_duration") or stop.get("lane_duration")
        events.append(
            {
                "id": f"pit-{stop.get('date')}-{stop.get('driver_number')}",
                "type": "pit",
                "message": (
                    f"{driver.get('name_acronym', stop.get('driver_number'))} pit stop"
                    f"{f' ({float(stop_duration):.1f}s)' if stop_duration not in (None, '') else ''}"
                ),
                "timestamp": _to_timestamp(stop.get("date")),
            }
        )

    for control in race_control[-8:]:
        events.append(
            {
                "id": f"control-{control.get('date')}-{control.get('category')}",
                "type": _event_type_from_race_control(
                    control.get("category"),
                    control.get("message"),
                ),
                "message": control.get("message") or control.get("category") or "Race control",
                "timestamp": _to_timestamp(control.get("date")),
            }
        )

    events.sort(key=lambda item: item["timestamp"], reverse=True)
    return events[:10]


async def build_race_snapshot(session_key: int | str | None = None):
    resolved_session = await resolve_session(session_key)
    if not resolved_session:
        return {
            "session": None,
            "positions": [],
            "lap": None,
            "weather": None,
            "highlights": [],
        }

    actual_session_key = resolved_session["session_key"]

    leaderboard, lap, weather_rows, highlights = await asyncio.gather(
        build_leaderboard(actual_session_key),
        build_lap_panel(actual_session_key),
        get_weather(actual_session_key),
        build_highlights(actual_session_key),
    )

    latest_weather = weather_rows[-1] if weather_rows else None
    session = await get_session(actual_session_key)

    return {
        "session": {
            "session_key": actual_session_key,
            "meeting_name": (session or resolved_session).get("meeting_name"),
            "session_name": (session or resolved_session).get("session_name"),
            "location": (session or resolved_session).get("location"),
            "country_name": (session or resolved_session).get("country_name"),
            "circuit_short_name": (session or resolved_session).get("circuit_short_name"),
        },
        "positions": leaderboard,
        "lap": lap,
        "weather": latest_weather,
        "highlights": highlights,
    }
