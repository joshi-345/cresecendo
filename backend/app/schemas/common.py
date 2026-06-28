"""
Crescendo — Common Pydantic Schemas
"""

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int
    has_more: bool


class ErrorResponse(BaseModel):
    detail: str
    status_code: int


class HealthCheck(BaseModel):
    status: str  # "healthy" | "degraded" | "unhealthy"
    version: str
    timestamp: str
    services: Optional[dict] = None


class MessageResponse(BaseModel):
    message: str
