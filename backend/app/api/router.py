"""Central API router combining all route modules."""

from fastapi import APIRouter

from app.api.routes import auth, users, projects, metrics, alerts, dashboard

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(projects.router)
api_router.include_router(metrics.router)
api_router.include_router(alerts.router)
api_router.include_router(dashboard.router)
