from app.application.race_snapshot import race_snapshot_service


async def build_race_snapshot(session_key=None):
    return await race_snapshot_service.build_snapshot(session_key)
