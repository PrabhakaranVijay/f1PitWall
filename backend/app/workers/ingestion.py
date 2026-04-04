import asyncio
import httpx
import json
from app.config import settings
from app.memory_store import pubsub_manager, set_cache
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cache the latest session globally so we don't query it constantly.
LATEST_SESSION_KEY = None

async def fetch_latest_session():
    """Retrieve the latest active session from OpenF1"""
    global LATEST_SESSION_KEY
    async with httpx.AsyncClient() as client:
        try:
            # Get latest session
            res = await client.get(f"{settings.OPENF1_API_URL}/sessions?year=2024")
            if res.status_code == 200:
                data = res.json()
                if data:
                    # Usually the last one or sort by date
                    latest = sorted(data, key=lambda x: x.get('date_start', ''), reverse=True)[0]
                    LATEST_SESSION_KEY = latest.get('session_key')
                    logger.info(f"Targeting active session: {LATEST_SESSION_KEY}")
                    # Cache session data
                    await set_cache("latest_session", json.dumps(latest))
        except Exception as e:
            logger.error(f"Error fetching session: {e}")

async def ingest_live_positions():
    """Poll for position updates and publish to Redis pub/sub for WebSockets."""
    global LATEST_SESSION_KEY
    if not LATEST_SESSION_KEY: return
    
    async with httpx.AsyncClient() as client:
        try:
            res = await client.get(f"{settings.OPENF1_API_URL}/position?session_key={LATEST_SESSION_KEY}")
            if res.status_code == 200:
                positions = res.json()
                # Store the most recent positions only (simplify: just push to stream or cache)
                await set_cache(f"live_positions:{LATEST_SESSION_KEY}", json.dumps(positions))
                # Publish to pub/sub for active WebSocket listeners
                await pubsub_manager.publish("live_positions_channel", json.dumps(positions))
        except Exception as e:
            logger.error(f"Position ingestion error: {e}")

async def ingestion_loop():
    """Main background loop to poll data from OpenF1"""
    logger.info("Starting OpenF1 data ingestion worker...")
    
    # 1. First find the latest session
    await fetch_latest_session()
    
    while True:
        try:
            # Wait for next poll interval
            await asyncio.sleep(settings.POLL_INTERVAL_SECONDS)
            
            # 2. Fire ingestion jobs concurrently
            await asyncio.gather(
                ingest_live_positions(),
                # Add ingest_live_telemetry() in full prod
                # Add ingest_laps() etc.
            )
        except Exception as e:
            logger.error(f"Ingestion loop error: {e}")
            await asyncio.sleep(5)
