"""User schemas."""

from datetime import datetime

from pydantic import BaseModel, EmailStr


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: str
    is_active: bool
    phone: str | None = None
    region: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    phone: str | None = None
    region: str | None = None
    role: str | None = None
    is_active: bool | None = None


class UserList(BaseModel):
    items: list[UserRead]
    total: int
