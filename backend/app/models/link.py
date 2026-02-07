"""Link/association table models (breaks circular imports)."""

from sqlmodel import Field, SQLModel


class UserTenant(SQLModel, table=True):
    """Many-to-many: users belong to multiple tenants (utilities)."""
    __tablename__ = "user_tenants"

    user_id: int = Field(foreign_key="users.id", primary_key=True)
    tenant_id: int = Field(foreign_key="tenants.id", primary_key=True)
