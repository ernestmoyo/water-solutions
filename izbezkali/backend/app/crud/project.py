"""Water project CRUD operations."""

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.project import WaterProject


async def create_project(session: AsyncSession, data: dict) -> WaterProject:
    project = WaterProject(**data)
    session.add(project)
    await session.flush()
    await session.refresh(project)
    return project


async def get_project(session: AsyncSession, project_id: int) -> WaterProject | None:
    result = await session.exec(
        select(WaterProject).where(WaterProject.id == project_id)
    )
    return result.first()


async def list_projects(
    session: AsyncSession,
    skip: int = 0,
    limit: int = 50,
    region: str | None = None,
    status: str | None = None,
    tenant_id: int | None = None,
    project_type: str | None = None,
) -> tuple[list[WaterProject], int]:
    query = select(WaterProject)
    count_query = select(func.count(WaterProject.id))

    if region:
        query = query.where(WaterProject.region == region)
        count_query = count_query.where(WaterProject.region == region)
    if status:
        query = query.where(WaterProject.status == status)
        count_query = count_query.where(WaterProject.status == status)
    if tenant_id:
        query = query.where(WaterProject.tenant_id == tenant_id)
        count_query = count_query.where(WaterProject.tenant_id == tenant_id)
    if project_type:
        query = query.where(WaterProject.project_type == project_type)
        count_query = count_query.where(WaterProject.project_type == project_type)

    total_result = await session.exec(count_query)
    total = total_result.one()

    result = await session.exec(query.offset(skip).limit(limit))
    projects = list(result.all())
    return projects, total


async def update_project(
    session: AsyncSession, project: WaterProject, updates: dict
) -> WaterProject:
    for key, value in updates.items():
        if value is not None:
            setattr(project, key, value)
    session.add(project)
    await session.flush()
    await session.refresh(project)
    return project


async def get_projects_for_map(
    session: AsyncSession,
    region: str | None = None,
) -> list[WaterProject]:
    """Get projects with coordinates for map display."""
    query = select(WaterProject).where(
        WaterProject.latitude.is_not(None),  # type: ignore
        WaterProject.longitude.is_not(None),  # type: ignore
    )
    if region:
        query = query.where(WaterProject.region == region)

    result = await session.exec(query)
    return list(result.all())
