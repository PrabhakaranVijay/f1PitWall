import asyncio

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.websocket.race_stream import build_race_snapshot

router = APIRouter()


async def _stream_snapshot(websocket: WebSocket, session_key: int | str | None):
    while True:
        snapshot = await build_race_snapshot(session_key)
        await websocket.send_json(snapshot)
        await asyncio.sleep(4)


@router.websocket("/ws/race")
async def websocket_race(websocket: WebSocket):
    await websocket.accept()
    session_key = websocket.query_params.get("session", "latest")

    try:
        await _stream_snapshot(websocket, session_key)
    except WebSocketDisconnect:
        print("Client disconnected from race stream")


@router.websocket("/ws/positions")
async def websocket_positions(websocket: WebSocket):
    await websocket.accept()
    session_key = websocket.query_params.get("session", "latest")

    try:
        while True:
            snapshot = await build_race_snapshot(session_key)
            await websocket.send_json(
                {
                    "session": snapshot.get("session"),
                    "positions": snapshot.get("positions", []),
                    "weather": [snapshot["weather"]] if snapshot.get("weather") else [],
                }
            )
            await asyncio.sleep(4)
    except WebSocketDisconnect:
        print("Client disconnected from positions stream")
