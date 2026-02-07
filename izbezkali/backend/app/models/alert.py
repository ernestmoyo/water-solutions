"""Alert and alert rule models."""

from datetime import datetime, timezone
from enum import Enum

from sqlmodel import Field, SQLModel


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class AlertStatus(str, Enum):
    ACTIVE = "active"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"
    SUPPRESSED = "suppressed"


class Alert(SQLModel, table=True):
    """Active and historical alerts for water projects."""
    __tablename__ = "alerts"

    id: int | None = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="water_projects.id", index=True)
    rule_id: int | None = Field(default=None, foreign_key="alert_rules.id")

    title: str = Field(max_length=255)
    message: str
    severity: str = Field(default=AlertSeverity.WARNING.value, max_length=20)
    status: str = Field(default=AlertStatus.ACTIVE.value, max_length=20, index=True)
    alert_type: str = Field(max_length=50)  # leak, pressure_drop, quality, maintenance

    # Context
    metric_type: str | None = Field(default=None, max_length=50)
    metric_value: float | None = Field(default=None)
    threshold_value: float | None = Field(default=None)

    acknowledged_by: int | None = Field(default=None, foreign_key="users.id")
    acknowledged_at: datetime | None = Field(default=None)
    resolved_at: datetime | None = Field(default=None)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        index=True,
    )


class AlertRule(SQLModel, table=True):
    """Configurable alert rules / thresholds."""
    __tablename__ = "alert_rules"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255)
    description: str | None = Field(default=None)
    is_active: bool = Field(default=True)

    # Conditions
    metric_type: str = Field(max_length=50)
    condition: str = Field(max_length=20)  # gt, lt, gte, lte, eq, anomaly
    threshold: float | None = Field(default=None)
    severity: str = Field(default=AlertSeverity.WARNING.value, max_length=20)

    # Scope
    project_id: int | None = Field(default=None, foreign_key="water_projects.id")
    tenant_id: int | None = Field(default=None, foreign_key="tenants.id")

    # Notification
    notify_sms: bool = Field(default=False)
    notify_email: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
