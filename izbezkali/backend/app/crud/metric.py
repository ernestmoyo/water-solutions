"""Metric CRUD operations with time-series support."""

from datetime import datetime, timezone, timedelta

from sqlmodel import select, func, text
from sqlmodel.ext.asyncio.session import AsyncSession

from app.models.metric import Metric, WaterQualityReading


async def create_metric(session: AsyncSession, data: dict) -> Metric:
    metric = Metric(**data)
    session.add(metric)
    await session.flush()
    await session.refresh(metric)
    return metric


async def batch_create_metrics(
    session: AsyncSession, metrics_data: list[dict]
) -> int:
    """Batch insert metrics for high-throughput IoT ingestion."""
    metrics = [Metric(**d) for d in metrics_data]
    session.add_all(metrics)
    await session.flush()
    return len(metrics)


async def get_metrics(
    session: AsyncSession,
    project_id: int,
    metric_type: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    limit: int = 1000,
) -> list[Metric]:
    query = select(Metric).where(Metric.project_id == project_id)

    if metric_type:
        query = query.where(Metric.metric_type == metric_type)
    if start_time:
        query = query.where(Metric.recorded_at >= start_time)
    if end_time:
        query = query.where(Metric.recorded_at <= end_time)

    query = query.order_by(Metric.recorded_at.desc()).limit(limit)  # type: ignore
    result = await session.exec(query)
    return list(result.all())


async def get_latest_metrics(
    session: AsyncSession,
    project_id: int,
) -> list[Metric]:
    """Get the latest reading for each metric type at a project."""
    # Use a subquery to get the max recorded_at per metric_type
    subquery = (
        select(
            Metric.metric_type,
            func.max(Metric.recorded_at).label("max_time"),
        )
        .where(Metric.project_id == project_id)
        .group_by(Metric.metric_type)
        .subquery()
    )

    query = (
        select(Metric)
        .join(
            subquery,
            (Metric.metric_type == subquery.c.metric_type)
            & (Metric.recorded_at == subquery.c.max_time),
        )
        .where(Metric.project_id == project_id)
    )

    result = await session.exec(query)
    return list(result.all())


async def get_aggregated_metrics(
    session: AsyncSession,
    project_id: int,
    metric_type: str,
    interval: str = "1 hour",
    start_time: datetime | None = None,
    end_time: datetime | None = None,
) -> list[dict]:
    """Aggregate metrics over time intervals (for charts)."""
    if not start_time:
        start_time = datetime.now(timezone.utc) - timedelta(days=7)
    if not end_time:
        end_time = datetime.now(timezone.utc)

    query = text("""
        SELECT
            date_trunc(:interval, recorded_at) as period,
            AVG(value) as avg_value,
            MIN(value) as min_value,
            MAX(value) as max_value,
            COUNT(*) as count
        FROM metrics
        WHERE project_id = :project_id
          AND metric_type = :metric_type
          AND recorded_at BETWEEN :start_time AND :end_time
        GROUP BY period
        ORDER BY period
    """)

    result = await session.exec(
        query,
        params={
            "interval": interval,
            "project_id": project_id,
            "metric_type": metric_type,
            "start_time": start_time,
            "end_time": end_time,
        },
    )
    rows = result.all()
    return [
        {
            "period": row[0].isoformat(),
            "avg_value": round(float(row[1]), 3),
            "min_value": round(float(row[2]), 3),
            "max_value": round(float(row[3]), 3),
            "count": row[4],
        }
        for row in rows
    ]


async def create_quality_reading(
    session: AsyncSession, data: dict
) -> WaterQualityReading:
    reading = WaterQualityReading(**data)
    # Auto-check compliance (Tanzania EWURA / WHO standards)
    reading.is_compliant = check_water_quality_compliance(reading)
    session.add(reading)
    await session.flush()
    await session.refresh(reading)
    return reading


def check_water_quality_compliance(reading: WaterQualityReading) -> bool:
    """Check against Tanzania/WHO drinking water standards."""
    if reading.ph is not None and not (6.5 <= reading.ph <= 8.5):
        return False
    if reading.turbidity_ntu is not None and reading.turbidity_ntu > 5.0:
        return False
    if reading.chlorine_mg_l is not None and not (0.2 <= reading.chlorine_mg_l <= 5.0):
        return False
    if reading.tds_mg_l is not None and reading.tds_mg_l > 1000:
        return False
    return True
