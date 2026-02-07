"""User model."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlmodel import Field, SQLModel, Relationship

from app.models.link import UserTenant

if TYPE_CHECKING:
    from app.models.project import Tenant


class User(SQLModel, table=True):
    __tablename__ = "users"

    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    full_name: str = Field(max_length=255)
    hashed_password: str = Field(max_length=255)
    role: str = Field(default="public", max_length=50, index=True)
    is_active: bool = Field(default=True)
    phone: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=100)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    tenants: list[Tenant] = Relationship(
        back_populates="users",
        link_model=UserTenant,
    )
