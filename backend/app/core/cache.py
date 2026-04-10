from __future__ import annotations

import asyncio
import time
from dataclasses import dataclass
from typing import Generic, TypeVar

T = TypeVar("T")


@dataclass
class CacheEntry(Generic[T]):
    value: T
    expires_at: float


class TTLCache(Generic[T]):
    def __init__(self):
        self._entries: dict[str, CacheEntry[T]] = {}
        self._lock = asyncio.Lock()

    async def get(self, key: str) -> T | None:
        async with self._lock:
            entry = self._entries.get(key)
            if entry is None:
                return None

            if entry.expires_at < time.monotonic():
                self._entries.pop(key, None)
                return None

            return entry.value

    async def set(self, key: str, value: T, ttl_seconds: float) -> T:
        async with self._lock:
            self._entries[key] = CacheEntry(
                value=value,
                expires_at=time.monotonic() + ttl_seconds,
            )
            return value

    async def get_or_set(self, key: str, ttl_seconds: float, factory):
        cached = await self.get(key)
        if cached is not None:
            return cached

        value = await factory()
        await self.set(key, value, ttl_seconds)
        return value

