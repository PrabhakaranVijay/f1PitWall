from __future__ import annotations

import asyncio
import logging
from typing import Any

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


class OpenF1Client:
    def __init__(self):
        self._base_url = settings.OPENF1_API_URL.rstrip("/")
        self._timeout = httpx.Timeout(settings.OPENF1_TIMEOUT_SECONDS, connect=10.0)
        self._semaphore = asyncio.Semaphore(settings.OPENF1_MAX_CONCURRENCY)

    async def get(
        self,
        endpoint: str,
        params: dict[str, Any] | None = None,
        *,
        allow_404: bool = False,
    ) -> list[dict[str, Any]]:
        delay = settings.OPENF1_INITIAL_BACKOFF_SECONDS

        for attempt in range(1, settings.OPENF1_MAX_RETRIES + 1):
            try:
                async with self._semaphore:
                    async with httpx.AsyncClient(timeout=self._timeout) as client:
                        response = await client.get(
                            f"{self._base_url}/{endpoint}",
                            params=params,
                        )

                if response.status_code == 404 and allow_404:
                    logger.warning(
                        "OpenF1 endpoint %s returned 404 with params=%s; falling back",
                        endpoint,
                        params,
                    )
                    return []

                if response.status_code == 429:
                    logger.warning(
                        "OpenF1 rate limit on %s attempt=%s params=%s",
                        endpoint,
                        attempt,
                        params,
                    )
                    if attempt == settings.OPENF1_MAX_RETRIES:
                        response.raise_for_status()

                    await asyncio.sleep(delay)
                    delay *= settings.OPENF1_BACKOFF_MULTIPLIER
                    continue

                response.raise_for_status()
                payload = response.json()
                return payload if isinstance(payload, list) else []
            except httpx.HTTPStatusError:
                raise
            except Exception as exc:
                logger.exception(
                    "OpenF1 request failed for %s params=%s attempt=%s",
                    endpoint,
                    params,
                    attempt,
                )
                if attempt == settings.OPENF1_MAX_RETRIES:
                    raise exc

                await asyncio.sleep(delay)
                delay *= settings.OPENF1_BACKOFF_MULTIPLIER

        return []


openf1_client = OpenF1Client()
