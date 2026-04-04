from __future__ import annotations

from datetime import datetime, timedelta
import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

OPENF1_BASE_URL = "https://api.openf1.org/v1"
DEFAULT_TIMEOUT = httpx.Timeout(15.0, connect=10.0)


async def _get_json(
    endpoint: str,
    params: dict[str, Any] | None = None,
) -> list[dict[str, Any]]:
    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        response = await client.get(f"{OPENF1_BASE_URL}/{endpoint}", params=params)
        response.raise_for_status()
        return response.json()


async def get_positions(session_key: int | str):
    return await _get_json("position", {"session_key": session_key})


async def get_drivers(session_key: int | str):
    return await _get_json("drivers", {"session_key": session_key})


async def get_intervals(session_key: int | str):
    return await _get_json("intervals", {"session_key": session_key})


async def get_weather(session_key: int | str):
    return await _get_json("weather", {"session_key": session_key})


async def get_laps(session_key: int | str):
    return await _get_json("laps", {"session_key": session_key})


async def get_stints(session_key: int | str):
    return await _get_json("stints", {"session_key": session_key})


async def get_overtakes(session_key: int | str):
    return await _get_json("overtakes", {"session_key": session_key})


async def get_race_control(session_key: int | str):
    return await _get_json("race_control", {"session_key": session_key})


async def get_pit(session_key: int | str):
    return await _get_json("pit", {"session_key": session_key})


async def get_session(session_key: int | str):
    sessions = await _get_json("sessions", {"session_key": session_key})
    return sessions[0] if sessions else None


async def get_latest_race_session(year: int | None = None):
    params: dict[str, Any] = {"session_type": "Race"}
    if year is not None:
        params["year"] = year

    sessions = await _get_json("sessions", params)
    if not sessions:
        return None

    return sorted(sessions, key=lambda item: item.get("date_start", ""), reverse=True)[0]


async def resolve_session(
    session_key: int | str | None = None,
    *,
    year: int | None = None,
):
    if session_key is None or session_key == "latest":
        return await get_latest_race_session(year=year)

    session = await get_session(session_key)
    if session:
        return session

    return None


async def fetch_track_data(session_key: int, driver_number: int, lap_number: int = 1):
    """
    Fetches the track coordinates for a given driver's lap and processes it.
    Applies simple smoothing, normalization and maps sector information.
    """
    async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
        lap_url = (
            f"{OPENF1_BASE_URL}/laps?session_key={session_key}"
            f"&driver_number={driver_number}&lap_number={lap_number}"
        )
        lap_resp = await client.get(lap_url)

        if lap_resp.status_code != 200 or not lap_resp.json():
            return None

        lap_data = lap_resp.json()[0]
        date_start_str = lap_data.get("date_start")

        if not date_start_str:
            return None

        date_start = datetime.fromisoformat(date_start_str.replace("Z", "+00:00"))

        s1_time = lap_data.get("duration_sector_1") or 0.0
        s2_time = lap_data.get("duration_sector_2") or 0.0
        s3_time = lap_data.get("duration_sector_3") or 0.0

        s1_end = date_start + timedelta(seconds=s1_time)
        s2_end = s1_end + timedelta(seconds=s2_time)

        lap_duration = lap_data.get("lap_duration")
        if not lap_duration:
            lap_duration = s1_time + s2_time + s3_time
        if not lap_duration:
            lap_duration = 120

        date_end = date_start + timedelta(seconds=lap_duration)

        start_fmt = date_start.isoformat()[:23]
        end_fmt = date_end.isoformat()[:23]

        loc_url = (
            f"{OPENF1_BASE_URL}/location?session_key={session_key}"
            f"&driver_number={driver_number}&date>={start_fmt}&date<={end_fmt}"
        )
        loc_resp = await client.get(loc_url)

        if loc_resp.status_code != 200:
            return None

        locations = loc_resp.json()
        if not locations:
            return None

        points = []
        for loc in locations:
            lx, ly = loc.get("x"), loc.get("y")
            loc_date_str = loc.get("date")
            if lx is None or ly is None or not loc_date_str:
                continue

            loc_date = datetime.fromisoformat(loc_date_str.replace("Z", "+00:00"))

            sector = 3
            if loc_date <= s1_end:
                sector = 1
            elif loc_date <= s2_end:
                sector = 2

            points.append(
                {
                    "x": lx,
                    "y": ly,
                    "sector": sector,
                    "timestamp": loc_date.timestamp(),
                }
            )

        if not points:
            return None

        smoothed = []
        window = 5
        for index in range(len(points)):
            start_idx = max(0, index - window // 2)
            end_idx = min(len(points), index + window // 2 + 1)
            window_points = points[start_idx:end_idx]

            avg_x = sum(point["x"] for point in window_points) / len(window_points)
            avg_y = sum(point["y"] for point in window_points) / len(window_points)
            smoothed.append(
                {
                    "x": avg_x,
                    "y": avg_y,
                    "sector": points[index]["sector"],
                    "timestamp": points[index]["timestamp"],
                }
            )

        min_x = min(point["x"] for point in smoothed)
        max_x = max(point["x"] for point in smoothed)
        min_y = min(point["y"] for point in smoothed)
        max_y = max(point["y"] for point in smoothed)

        range_x = max_x - min_x if max_x != min_x else 1
        range_y = max_y - min_y if max_y != min_y else 1
        max_range = max(range_x, range_y)

        for point in smoothed:
            point["x"] = (point["x"] - min_x) / max_range
            point["y"] = (point["y"] - min_y) / max_range

        first_ts = smoothed[0]["timestamp"]
        for point in smoothed:
            point["timestamp"] = point["timestamp"] - first_ts

        total_pts = len(smoothed)
        drs_zones = [
            {
                "zone": 1,
                "start_index": int(total_pts * 0.1),
                "end_index": int(total_pts * 0.2),
            }
        ]

        return {"track": smoothed, "drs_zones": drs_zones}
