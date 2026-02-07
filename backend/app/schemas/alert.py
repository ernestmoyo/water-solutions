"""Alert schemas."""

from datetime import datetime

from pydantic import BaseModel


class AlertCreate(BaseModel):
    project_id: int
    title: str
    message: str
    severity: str = "warning"
    alert_type: str
    metric_type: str | None = None
    metric_value: float | None = None
    threshold_value: float | None = None


class AlertRead(BaseModel):
    id: int
    project_id: int
    title: str
    message: str
    severity: str
    status: str
    alert_type: str
    metric_type: str | None = None
    metric_value: float | None = None
    threshold_value: float | None = None
    acknowledged_by: int | None = None
    acknowledged_at: datetime | None = None
    resolved_at: datetime | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class AlertAcknowledge(BaseModel):
    notes: str | None = None


class AlertRuleCreate(BaseModel):
    name: str
    description: str | None = None
    metric_type: str
    condition: str  # gt, lt, gte, lte, eq, anomaly
    threshold: float | None = None
    severity: str = "warning"
    project_id: int | None = None
    tenant_id: int | None = None
    notify_sms: bool = False
    notify_email: bool = True


class AlertRuleRead(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_active: bool
    metric_type: str
    condition: str
    threshold: float | None = None
    severity: str
    project_id: int | None = None
    tenant_id: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
