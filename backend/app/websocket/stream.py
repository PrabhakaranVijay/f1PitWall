import asyncio
import logging

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.application.race_snapshot import race_snapshot_service
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def _positions_projection(snapshot: dict) -> dict:
    weather = snapshot.get("weather")
    return {
        "session": snapshot.get("session"),
        "positions": snapshot.get("positions", []),
        "weather": [weather] if weather else [],
        "domains": snapshot.get("domains", {}),
    }


async def _stream(websocket: WebSocket, session_key: str | None, projection=None):
    last_snapshot = {
        "session": None,
        "positions": [],
        "lap": None,
        "weather": None,
        "highlights": [],
        "domains": {},
    }

    while True:
        try:
            snapshot = await race_snapshot_service.build_snapshot(session_key)
            last_snapshot = snapshot
        except Exception as exc:
            logger.exception("Snapshot build failed for websocket session=%s", session_key)
            last_snapshot = {
                **last_snapshot,
                "domains": {
                    **last_snapshot.get("domains", {}),
                    "aggregator": {
                        "status": "degraded",
                        "errors": [str(exc)],
                    },
                },
            }

        payload = projection(last_snapshot) if projection else last_snapshot
        await websocket.send_json(payload)
        await asyncio.sleep(settings.WEBSOCKET_UPDATE_INTERVAL_SECONDS)


@router.websocket("/ws/race")
async def websocket_race(websocket: WebSocket):
    await websocket.accept()
    session_key = websocket.query_params.get("session", "latest")

    try:
        await _stream(websocket, session_key)
    except WebSocketDisconnect:
        logger.info("Race websocket disconnected session=%s", session_key)
    except Exception:
        logger.exception("Race websocket crashed session=%s", session_key)
        await websocket.close()


@router.websocket("/ws/positions")
async def websocket_positions(websocket: WebSocket):
    await websocket.accept()
    session_key = websocket.query_params.get("session", "latest")

    try:
        await _stream(websocket, session_key, projection=_positions_projection)
    except WebSocketDisconnect:
        logger.info("Position websocket disconnected session=%s", session_key)
    except Exception:
        logger.exception("Position websocket crashed session=%s", session_key)
        await websocket.close()
