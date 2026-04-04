from fastapi import APIRouter, HTTPException, Query
from app.services.openf1 import fetch_track_data

router = APIRouter(tags=["Track"])

@router.get("/track")
async def get_track(
    session_key: int = Query(..., description="OpenF1 session key"),
    driver_number: int = Query(..., description="Driver number"),
    lap_number: int = Query(1, description="Lap number to fetch telemetry for")
):
    """
    Returns the smoothed, normalized track coordinates (X, Y) and sector information
    for the specified driver and lap number.
    """
    try:
        data = await fetch_track_data(session_key, driver_number, lap_number)
        if not data:
            raise HTTPException(status_code=404, detail="Track telemetry data not found for given session/driver/lap")
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
