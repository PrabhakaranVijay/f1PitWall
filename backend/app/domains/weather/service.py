from __future__ import annotations

import logging

from app.config import settings
from app.core.cache import TTLCache
from app.core.domain import DomainPayload
from app.infrastructure.openf1_client import OpenF1Client, openf1_client

logger = logging.getLogger(__name__)


class WeatherService:
    def __init__(self, client: OpenF1Client | None = None):
        self._client = client or openf1_client
        self._cache: TTLCache[dict | None] = TTLCache()

    async def get(self, session_key: int) -> DomainPayload[dict | None]:
        cache_key = f"weather:{session_key}"
        cached = await self._cache.get(cache_key)
        if cached is not None:
            return DomainPayload.ok(cached)

        try:
            readings = await self._client.get("weather", {"session_key": session_key})
            latest = readings[-1] if readings else None
            await self._cache.set(
                cache_key,
                latest,
                settings.WEATHER_CACHE_TTL_SECONDS,
            )
            return DomainPayload.ok(latest)
        except Exception as exc:
            logger.exception("Weather domain failed for session=%s", session_key)
            cached = await self._cache.get(cache_key)
            if cached is not None:
                return DomainPayload(data=cached, status="stale", errors=[str(exc)])
            return DomainPayload.degraded(None, str(exc))
