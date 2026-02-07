"""User CRUD operations."""

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.user import User
from app.core.security import hash_password


async def get_user_by_email(session: AsyncSession, email: str) -> User | None:
    result = await session.exec(select(User).where(User.email == email))
    return result.first()


async def get_user_by_id(session: AsyncSession, user_id: int) -> User | None:
    result = await session.exec(select(User).where(User.id == user_id))
    return result.first()


async def create_user(
    session: AsyncSession,
    email: str,
    full_name: str,
    password: str,
    role: str = "public",
    phone: str | None = None,
    region: str | None = None,
) -> User:
    user = User(
        email=email,
        full_name=full_name,
        hashed_password=hash_password(password),
        role=role,
        phone=phone,
        region=region,
    )
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user


async def list_users(
    session: AsyncSession, skip: int = 0, limit: int = 50
) -> tuple[list[User], int]:
    count_result = await session.exec(select(func.count(User.id)))
    total = count_result.one()

    result = await session.exec(select(User).offset(skip).limit(limit))
    users = list(result.all())
    return users, total


async def update_user(
    session: AsyncSession, user: User, updates: dict
) -> User:
    for key, value in updates.items():
        if value is not None:
            setattr(user, key, value)
    session.add(user)
    await session.flush()
    await session.refresh(user)
    return user
