"""Metric schemas."""

from datetime import datetime

from pydantic import BaseModel


class MetricCreate(BaseModel):
    project_id: int
    sensor_id: str | None = None
    metric_type: str
    value: float
    unit: str
    recorded_at: datetime | None = None


class MetricRead(BaseModel):
    id: int
    project_id: int
    sensor_id: str | None = None
    metric_type: str
    value: float
    unit: str
    is_anomaly: bool
    anomaly_score: float | None = None
    quality_flag: str | None = None
    recorded_at: datetime

    model_config = {"from_attributes": True}


class MetricBatchCreate(BaseModel):
    """Batch ingest multiple metrics at once (IoT / CSV upload)."""
    metrics: list[MetricCreate]


class MetricAggregation(BaseModel):
    metric_type: str
    avg_value: float
    min_value: float
    max_value: float
    count: int
    unit: str
    period_start: datetime
    period_end: datetime


class WaterQualityCreate(BaseModel):
    project_id: int
    sensor_id: str | None = None
    ph: float | None = None
    turbidity_ntu: float | None = None
    chlorine_mg_l: float | None = None
    tds_mg_l: float | None = None
    conductivity_us_cm: float | None = None
    temperature_c: float | None = None
    dissolved_oxygen_mg_l: float | None = None
    recorded_at: datetime | None = None


class WaterQualityRead(BaseModel):
    id: int
    project_id: int
    ph: float | None = None
    turbidity_ntu: float | None = None
    chlorine_mg_l: float | None = None
    tds_mg_l: float | None = None
    is_compliant: bool
    recorded_at: datetime

    model_config = {"from_attributes": True}


class DashboardKPIs(BaseModel):
    """National-level KPIs for the minister dashboard."""
    total_projects: int
    operational_projects: int
    total_population_served: int
    total_connections: int
    avg_flow_rate_ls: float
    avg_pressure_bar: float
    active_alerts: int
    nrw_percentage: float  # Non-Revenue Water %
    water_quality_compliance_pct: float
