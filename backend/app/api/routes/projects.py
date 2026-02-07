"""Water project endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.rbac import Role, get_current_user, require_role, require_permission
from app.crud.project import (
    create_project,
    get_project,
    list_projects,
    update_project,
    get_projects_for_map,
)
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate, ProjectList

router = APIRouter(prefix="/projects", tags=["Water Projects"])


@router.get("", response_model=ProjectList)
async def get_projects(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(get_current_user)],
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    region: str | None = None,
    status: str | None = None,
    tenant_id: int | None = None,
    project_type: str | None = None,
):
    projects, total = await list_projects(
        session, skip, limit, region, status, tenant_id, project_type
    )
    return ProjectList(items=projects, total=total)


@router.post("", response_model=ProjectRead, status_code=201)
async def add_project(
    data: ProjectCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("manage:projects"))],
):
    project = await create_project(session, data.model_dump())
    return project


@router.get("/map", response_model=list[ProjectRead])
async def get_map_projects(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:map"))],
    region: str | None = None,
):
    """Get projects with coordinates for map visualization."""
    return await get_projects_for_map(session, region)


@router.get("/{project_id}", response_model=ProjectRead)
async def get_single_project(
    project_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(get_current_user)],
):
    project = await get_project(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectRead)
async def patch_project(
    project_id: int,
    updates: ProjectUpdate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("manage:projects"))],
):
    project = await get_project(session, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    updated = await update_project(
        session, project, updates.model_dump(exclude_unset=True)
    )
    return updated
