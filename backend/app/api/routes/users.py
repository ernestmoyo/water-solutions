"""User management endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.rbac import Role, get_current_user, require_role
from app.crud.user import list_users, get_user_by_id, update_user
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate, UserList

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserRead)
async def get_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.get("", response_model=UserList)
async def get_users(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(Role.MINISTER, Role.CEO))],
    skip: int = 0,
    limit: int = 50,
):
    users, total = await list_users(session, skip, limit)
    return UserList(items=users, total=total)


@router.get("/{user_id}", response_model=UserRead)
async def get_user(
    user_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(Role.MINISTER, Role.CEO))],
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/{user_id}", response_model=UserRead)
async def patch_user(
    user_id: int,
    updates: UserUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_role(Role.MINISTER, Role.CEO))],
):
    user = await get_user_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    updated = await update_user(session, user, updates.model_dump(exclude_unset=True))
    return updated
