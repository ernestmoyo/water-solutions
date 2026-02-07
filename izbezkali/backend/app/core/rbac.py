"""Role-Based Access Control (RBAC) middleware and dependencies."""

from enum import Enum
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_token
from app.core.database import get_session
from app.models.user import User

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


class Role(str, Enum):
    MINISTER = "minister"
    CEO = "ceo"
    MANAGER = "manager"
    OPERATOR = "operator"
    ANALYST = "analyst"
    PUBLIC = "public"


# Permission matrix: role -> allowed actions
PERMISSIONS: dict[Role, set[str]] = {
    Role.MINISTER: {
        "view:national_dashboard",
        "view:kpis",
        "view:alerts",
        "view:reports",
        "view:map",
        "export:reports",
        "manage:users",
    },
    Role.CEO: {
        "view:regional_dashboard",
        "view:kpis",
        "view:alerts",
        "view:reports",
        "view:map",
        "view:metrics",
        "export:reports",
        "manage:projects",
        "manage:operators",
    },
    Role.MANAGER: {
        "view:regional_dashboard",
        "view:metrics",
        "view:alerts",
        "view:map",
        "manage:projects",
        "export:reports",
    },
    Role.OPERATOR: {
        "view:site_dashboard",
        "view:metrics",
        "view:alerts",
        "create:metrics",
        "create:readings",
        "upload:data",
    },
    Role.ANALYST: {
        "view:regional_dashboard",
        "view:metrics",
        "view:kpis",
        "view:reports",
        "view:map",
        "export:reports",
    },
    Role.PUBLIC: {
        "view:public_dashboard",
        "view:map",
    },
}


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: Annotated[AsyncSession, Depends(get_session)],
) -> User:
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing subject",
        )

    result = await session.exec(select(User).where(User.id == int(user_id)))
    user = result.first()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def require_role(*roles: Role):
    """Dependency factory: require user to have one of the specified roles."""

    async def role_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if Role(current_user.role) not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Role '{current_user.role}' not authorized. Required: {[r.value for r in roles]}",
            )
        return current_user

    return role_checker


def require_permission(permission: str):
    """Dependency factory: require user's role to have a specific permission."""

    async def permission_checker(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        user_role = Role(current_user.role)
        if permission not in PERMISSIONS.get(user_role, set()):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission '{permission}' not granted to role '{current_user.role}'",
            )
        return current_user

    return permission_checker
