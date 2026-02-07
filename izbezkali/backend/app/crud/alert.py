"""Alert CRUD operations."""

from datetime import datetime, timezone

from sqlmodel import select, func
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.alert import Alert, AlertRule


async def create_alert(session: AsyncSession, data: dict) -> Alert:
    alert = Alert(**data)
    session.add(alert)
    await session.flush()
    await session.refresh(alert)
    return alert


async def get_active_alerts(
    session: AsyncSession,
    project_id: int | None = None,
    tenant_id: int | None = None,
    severity: str | None = None,
    limit: int = 100,
) -> list[Alert]:
    query = select(Alert).where(Alert.status == "active")

    if project_id:
        query = query.where(Alert.project_id == project_id)
    if severity:
        query = query.where(Alert.severity == severity)

    query = query.order_by(Alert.created_at.desc()).limit(limit)  # type: ignore
    result = await session.exec(query)
    return list(result.all())


async def acknowledge_alert(
    session: AsyncSession, alert_id: int, user_id: int
) -> Alert | None:
    result = await session.exec(select(Alert).where(Alert.id == alert_id))
    alert = result.first()
    if alert:
        alert.status = "acknowledged"
        alert.acknowledged_by = user_id
        alert.acknowledged_at = datetime.now(timezone.utc)
        session.add(alert)
        await session.flush()
        await session.refresh(alert)
    return alert


async def resolve_alert(session: AsyncSession, alert_id: int) -> Alert | None:
    result = await session.exec(select(Alert).where(Alert.id == alert_id))
    alert = result.first()
    if alert:
        alert.status = "resolved"
        alert.resolved_at = datetime.now(timezone.utc)
        session.add(alert)
        await session.flush()
        await session.refresh(alert)
    return alert


async def count_active_alerts(
    session: AsyncSession,
    project_id: int | None = None,
) -> int:
    query = select(func.count(Alert.id)).where(Alert.status == "active")
    if project_id:
        query = query.where(Alert.project_id == project_id)
    result = await session.exec(query)
    return result.one()


async def get_alert_rules(
    session: AsyncSession, is_active: bool = True
) -> list[AlertRule]:
    result = await session.exec(
        select(AlertRule).where(AlertRule.is_active == is_active)
    )
    return list(result.all())


async def create_alert_rule(session: AsyncSession, data: dict) -> AlertRule:
    rule = AlertRule(**data)
    session.add(rule)
    await session.flush()
    await session.refresh(rule)
    return rule
