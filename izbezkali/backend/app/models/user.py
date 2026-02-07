"""User and role models."""

from datetime import datetime, timezone

from sqlmodel import Field, SQLModel, Relationship


class UserTenant(SQLModel, table=True):
    """Many-to-many: users belong to multiple tenants (utilities)."""
    __tablename__ = "user_tenants"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    tenant_id: int = Field(foreign_key="tenants.id", primary_key=True)


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
    tenants: list["Tenant"] = Relationship(  # type: ignore
        back_populates="users",
        link_model=UserTenant,
    )

    class Config:
        from_attributes = True


# Forward ref resolved after Tenant import
from app.models.project import Tenant  # noqa: E402, F811

User.model_rebuild()
