"""Time-series metric models for water monitoring data."""

from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class Metric(SQLModel, table=True):
    """Time-series water metrics (flow, pressure, levels).

    With TimescaleDB, this table is converted to a hypertable
    partitioned on `recorded_at` for high-throughput ingestion.
    """
    __tablename__ = "metrics"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="water_projects.id", index=True)
    sensor_id: str | None = Field(default=None, max_length=100, index=True)

    # Metric type: flow, pressure, level, energy, nrw
    metric_type: str = Field(max_length=50, index=True)

    value: float
    unit: str = Field(max_length=20)  # L/s, m³/h, bar, psi, m, kWh, %

    # Quality flags
    is_anomaly: bool = Field(default=False)
    anomaly_score: float | None = Field(default=None)
    quality_flag: str | None = Field(default=None, max_length=20)  # good, suspect, bad

    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
    )
    ingested_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc)
    )


class WaterQualityReading(SQLModel, table=True):
    """Water quality parameters (pH, turbidity, chlorine, etc.)."""
    __tablename__ = "water_quality_readings"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="water_projects.id", index=True)
    sensor_id: str | None = Field(default=None, max_length=100)

    ph: float | None = Field(default=None)
    turbidity_ntu: float | None = Field(default=None)
    chlorine_mg_l: float | None = Field(default=None)
    tds_mg_l: float | None = Field(default=None)  # Total Dissolved Solids
    conductivity_us_cm: float | None = Field(default=None)
    temperature_c: float | None = Field(default=None)
    dissolved_oxygen_mg_l: float | None = Field(default=None)

    is_compliant: bool = Field(default=True)
    notes: str | None = Field(default=None)

    recorded_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
    )
