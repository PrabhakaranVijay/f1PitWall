from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Generic, TypeVar

T = TypeVar("T")


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@dataclass
class DomainPayload(Generic[T]):
    data: T
    status: str = "ok"
    errors: list[str] = field(default_factory=list)
    updated_at: str = field(default_factory=utc_now_iso)

    @classmethod
    def ok(cls, data: T) -> "DomainPayload[T]":
        return cls(data=data, status="ok")

    @classmethod
    def degraded(cls, data: T, error: str) -> "DomainPayload[T]":
        return cls(data=data, status="degraded", errors=[error])

