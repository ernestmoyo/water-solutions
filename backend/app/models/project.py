"""Water project and tenant models."""

from datetime import datetime, timezone
from enum import Enum

from sqlmodel import Field, SQLModel, Relationship

from app.models.link import UserTenant


class ProjectStatus(str, Enum):
    PLANNING = "planning"
    UNDER_CONSTRUCTION = "under_construction"
    OPERATIONAL = "operational"
    MAINTENANCE = "maintenance"
    DECOMMISSIONED = "decommissioned"


class ProjectType(str, Enum):
    BOREHOLE = "borehole"
    PUMP_STATION = "pump_station"
    TREATMENT_PLANT = "treatment_plant"
    DISTRIBUTION_NETWORK = "distribution_network"
    RESERVOIR = "reservoir"
    DAM = "dam"
    INTAKE = "intake"
    DESALINATION = "desalination"


class Tenant(SQLModel, table=True):
    """Utility / organization (multi-tenant support)."""
    __tablename__ = "tenants"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, max_length=255)
    code: str = Field(unique=True, max_length=20)
    region: str = Field(max_length=100)
    contact_email: str | None = Field(default=None, max_length=255)
    contact_phone: str | None = Field(default=None, max_length=20)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    # Relationships
    users: list["User"] = Relationship(
        back_populates="tenants",
        link_model=UserTenant,
    )
    projects: list["WaterProject"] = Relationship(back_populates="tenant")


class WaterProject(SQLModel, table=True):
    """A water infrastructure project / site."""
    __tablename__ = "water_projects"

    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(max_length=255, index=True)
    project_code: str = Field(unique=True, max_length=50)
    project_type: str = Field(max_length=50)
    status: str = Field(default=ProjectStatus.OPERATIONAL.value, max_length=30)
    description: str | None = Field(default=None)

    # Location
    region: str = Field(max_length=100, index=True)
    district: str = Field(max_length=100)
    ward: str | None = Field(default=None, max_length=100)
    latitude: float | None = Field(default=None)
    longitude: float | None = Field(default=None)

    # Capacity
    design_capacity_m3_per_day: float | None = Field(default=None)
    current_capacity_m3_per_day: float | None = Field(default=None)
    population_served: int | None = Field(default=None)
    connection_count: int | None = Field(default=None)

    # Tenant
    tenant_id: int | None = Field(default=None, foreign_key="tenants.id")
    tenant: Tenant | None = Relationship(back_populates="projects")

    # Timestamps
    commissioned_date: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
