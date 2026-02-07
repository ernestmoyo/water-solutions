"""Alert endpoints."""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel.ext.asyncio.session import AsyncSession

from app.core.database import get_session
from app.core.rbac import get_current_user, require_permission
from app.crud.alert import (
    get_active_alerts,
    acknowledge_alert,
    resolve_alert,
    get_alert_rules,
    create_alert_rule,
)
from app.models.user import User
from app.schemas.alert import AlertRead, AlertAcknowledge, AlertRuleCreate, AlertRuleRead

router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", response_model=list[AlertRead])
async def get_alerts(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:alerts"))],
    project_id: int | None = None,
    severity: str | None = None,
    limit: int = 100,
):
    return await get_active_alerts(session, project_id, severity=severity, limit=limit)


@router.post("/{alert_id}/acknowledge", response_model=AlertRead)
async def ack_alert(
    alert_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    user: Annotated[User, Depends(require_permission("view:alerts"))],
):
    alert = await acknowledge_alert(session, alert_id, user.id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/resolve", response_model=AlertRead)
async def res_alert(
    alert_id: int,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:alerts"))],
):
    alert = await resolve_alert(session, alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.get("/rules", response_model=list[AlertRuleRead])
async def get_rules(
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("view:alerts"))],
):
    return await get_alert_rules(session)


@router.post("/rules", response_model=AlertRuleRead, status_code=201)
async def add_rule(
    data: AlertRuleCreate,
    session: Annotated[AsyncSession, Depends(get_session)],
    _: Annotated[User, Depends(require_permission("manage:projects"))],
):
    return await create_alert_rule(session, data.model_dump())
