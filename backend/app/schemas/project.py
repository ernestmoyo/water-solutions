"""Water project schemas."""

from datetime import datetime

from pydantic import BaseModel


class ProjectCreate(BaseModel):
    name: str
    project_code: str
    project_type: str
    status: str = "operational"
    description: str | None = None
    region: str
    district: str
    ward: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    design_capacity_m3_per_day: float | None = None
    current_capacity_m3_per_day: float | None = None
    population_served: int | None = None
    connection_count: int | None = None
    tenant_id: int | None = None
    commissioned_date: datetime | None = None


class ProjectRead(BaseModel):
    id: int
    name: str
    project_code: str
    project_type: str
    status: str
    description: str | None = None
    region: str
    district: str
    ward: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    design_capacity_m3_per_day: float | None = None
    current_capacity_m3_per_day: float | None = None
    population_served: int | None = None
    connection_count: int | None = None
    tenant_id: int | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class ProjectUpdate(BaseModel):
    name: str | None = None
    status: str | None = None
    description: str | None = None
    current_capacity_m3_per_day: float | None = None
    population_served: int | None = None
    connection_count: int | None = None


class ProjectList(BaseModel):
    items: list[ProjectRead]
    total: int
