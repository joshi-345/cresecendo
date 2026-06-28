"""
Crescendo — Billing Pydantic Schemas
"""

from pydantic import BaseModel, Field


class CheckoutRequest(BaseModel):
    tier: str = Field(..., pattern="^(pro|studio)$")


class SessionUrlResponse(BaseModel):
    url: str
