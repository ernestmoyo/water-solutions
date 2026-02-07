"""Dashboard KPI and summary endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.rbac import get_current_user, require_permission, Role
from app.models.user import User
from app.models.project import WaterProject
from app.models.metric import Metric
from app.models.alert import Alert
from app.schemas.metric import DashboardKPIs

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/kpis", response_model=DashboardKPIs)
async def get_national_kpis(
    session: Annotated[AsyncSession, Depends(get_session)],
    user: Annotated[User, Depends(require_permission("view:kpis"))],
    region: str | None = None,
    tenant_id: int | None = None,
):
    """National or regional KPI summary for minister/CEO dashboard."""

    # Total and operational projects
    project_query = select(func.count(WaterProject.id))
    op_query = select(func.count(WaterProject.id)).where(
        WaterProject.status == "operational"
    )
    pop_query = select(func.coalesce(func.sum(WaterProject.population_served), 0))
    conn_query = select(func.coalesce(func.sum(WaterProject.connection_count), 0))

    if region:
        project_query = project_query.where(WaterProject.region == region)
        op_query = op_query.where(WaterProject.region == region)
        pop_query = pop_query.where(WaterProject.region == region)
        conn_query = conn_query.where(WaterProject.region == region)

    if tenant_id:
        project_query = project_query.where(WaterProject.tenant_id == tenant_id)
        op_query = op_query.where(WaterProject.tenant_id == tenant_id)
        pop_query = pop_query.where(WaterProject.tenant_id == tenant_id)
        conn_query = conn_query.where(WaterProject.tenant_id == tenant_id)

    total_result = await session.exec(project_query)
    total_projects = total_result.one()

    op_result = await session.exec(op_query)
    operational = op_result.one()

    pop_result = await session.exec(pop_query)
    population = pop_result.one()

    conn_result = await session.exec(conn_query)
    connections = conn_result.one()

    # Average flow & pressure from latest metrics
    flow_result = await session.exec(
        select(func.coalesce(func.avg(Metric.value), 0)).where(
            Metric.metric_type == "flow"
        )
    )
    avg_flow = round(float(flow_result.one()), 2)

    pressure_result = await session.exec(
        select(func.coalesce(func.avg(Metric.value), 0)).where(
            Metric.metric_type == "pressure"
        )
    )
    avg_pressure = round(float(pressure_result.one()), 2)

    # Active alerts count
    alert_result = await session.exec(
        select(func.count(Alert.id)).where(Alert.status == "active")
    )
    active_alerts = alert_result.one()

    # NRW placeholder (would need production/billing data)
    nrw_pct = 35.0  # Tanzania average ~35%

    # Water quality compliance
    from app.models.metric import WaterQualityReading

    compliant_result = await session.exec(
        select(func.count(WaterQualityReading.id)).where(
            WaterQualityReading.is_compliant == True  # noqa: E712
        )
    )
    total_quality = await session.exec(
        select(func.count(WaterQualityReading.id))
    )
    compliant = compliant_result.one()
    total_q = total_quality.one()
    compliance_pct = round((compliant / total_q * 100) if total_q > 0 else 100.0, 1)

    return DashboardKPIs(
        total_projects=total_projects,
        operational_projects=operational,
        total_population_served=population,
        total_connections=connections,
        avg_flow_rate_ls=avg_flow,
        avg_pressure_bar=avg_pressure,
        active_alerts=active_alerts,
        nrw_percentage=nrw_pct,
        water_quality_compliance_pct=compliance_pct,
    )


@router.get("/regions")
async def get_region_summary(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:kpis"))],
):
    """Per-region breakdown for map / table views."""
    result = await session.exec(
        select(
            WaterProject.region,
            func.count(WaterProject.id).label("project_count"),
            func.coalesce(func.sum(WaterProject.population_served), 0).label(
                "population"
            ),
        ).group_by(WaterProject.region)
    )
    rows = result.all()
    return [
        {
            "region": row[0],
            "project_count": row[1],
            "population_served": row[2],
        }
        for row in rows
    ]
