"""Metrics and sensor data endpoints."""

from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.rbac import get_current_user, require_permission
from app.crud.metric import (
    create_metric,
    batch_create_metrics,
    get_metrics,
    get_latest_metrics,
    get_aggregated_metrics,
    create_quality_reading,
)
from app.models.user import User
from app.schemas.metric import (
    MetricCreate,
    MetricRead,
    MetricBatchCreate,
    WaterQualityCreate,
    WaterQualityRead,
)
from app.services.anomaly import anomaly_detector

router = APIRouter(prefix="/metrics", tags=["Metrics & Sensor Data"])


@router.post("", response_model=MetricRead, status_code=201)
async def add_metric(
    data: MetricCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("create:metrics"))],
):
    """Ingest a single metric reading."""
    metric_data = data.model_dump()

    # Run anomaly detection
    is_anomaly, score = anomaly_detector.detect_simple(data.metric_type, data.value)
    metric_data["is_anomaly"] = is_anomaly
    metric_data["anomaly_score"] = score
    metric_data["quality_flag"] = "suspect" if is_anomaly else "good"

    metric = await create_metric(session, metric_data)
    return metric


@router.post("/batch", status_code=201)
async def add_metrics_batch(
    data: MetricBatchCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("create:metrics"))],
):
    """Batch ingest metrics (IoT / SCADA integration)."""
    metrics_data = []
    for m in data.metrics:
        d = m.model_dump()
        is_anomaly, score = anomaly_detector.detect_simple(m.metric_type, m.value)
        d["is_anomaly"] = is_anomaly
        d["anomaly_score"] = score
        d["quality_flag"] = "suspect" if is_anomaly else "good"
        metrics_data.append(d)

    count = await batch_create_metrics(session, metrics_data)
    return {"ingested": count}


@router.get("/{project_id}", response_model=list[MetricRead])
async def get_project_metrics(
    project_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:metrics"))],
    metric_type: str | None = None,
    start_time: datetime | None = None,
    end_time: datetime | None = None,
    limit: int = Query(default=500, le=5000),
):
    return await get_metrics(session, project_id, metric_type, start_time, end_time, limit)


@router.get("/{project_id}/latest", response_model=list[MetricRead])
async def get_project_latest(
    project_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:metrics"))],
):
    """Get latest readings for each metric type at a project."""
    return await get_latest_metrics(session, project_id)


@router.get("/{project_id}/aggregated")
async def get_project_aggregated(
    project_id: int,
    metric_type: str,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:metrics"))],
    interval: str = "1 hour",
    start_time: datetime | None = None,
    end_time: datetime | None = None,
):
    """Get aggregated metrics for charts."""
    return await get_aggregated_metrics(
        session, project_id, metric_type, interval, start_time, end_time
    )


@router.post("/quality", response_model=WaterQualityRead, status_code=201)
async def add_quality_reading(
    data: WaterQualityCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("create:readings"))],
):
    """Ingest a water quality reading."""
    return await create_quality_reading(session, data.model_dump())


@router.post("/upload/csv")
async def upload_csv(
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_session),
    user: User = Depends(require_permission("upload:data")),
):
    """Upload CSV/Excel file with metric readings."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    suffix = file.filename.rsplit(".", 1)[-1].lower()
    if suffix not in ("csv", "xlsx", "xls"):
        raise HTTPException(status_code=400, detail="Only CSV and Excel files accepted")

    content = await file.read()

    try:
        import pandas as pd
        import io

        if suffix == "csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))

        required_cols = {"project_id", "metric_type", "value", "unit"}
        if not required_cols.issubset(set(df.columns)):
            raise HTTPException(
                status_code=400,
                detail=f"CSV must contain columns: {required_cols}",
            )

        metrics_data = []
        for _, row in df.iterrows():
            d = {
                "project_id": int(row["project_id"]),
                "metric_type": str(row["metric_type"]),
                "value": float(row["value"]),
                "unit": str(row["unit"]),
                "sensor_id": str(row.get("sensor_id", "")),
            }
            is_anomaly, score = anomaly_detector.detect_simple(
                d["metric_type"], d["value"]
            )
            d["is_anomaly"] = is_anomaly
            d["anomaly_score"] = score
            d["quality_flag"] = "suspect" if is_anomaly else "good"
            metrics_data.append(d)

        count = await batch_create_metrics(session, metrics_data)
        return {"ingested": count, "filename": file.filename}

    except ImportError:
        raise HTTPException(
            status_code=500, detail="pandas not installed for CSV processing"
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {e}")
