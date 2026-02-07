# Izbezkal&#299; — Architecture Documentation

## System Architecture

```
                    ┌──────────────────────────────┐
                    │       End Users              │
                    │  (Minister, CEO, Operators)  │
                    └──────────┬───────────────────┘
                               │
                    ┌──────────▼───────────────────┐
                    │     Frontend (React SPA)      │
                    │  - Vite + TypeScript          │
                    │  - Tailwind CSS               │
                    │  - Leaflet Maps               │
                    │  - Recharts                   │
                    │  - TanStack Query             │
                    │  - PWA (offline support)      │
                    └──────────┬───────────────────┘
                               │ REST API (JSON)
                    ┌──────────▼───────────────────┐
                    │     Backend (FastAPI)         │
                    │  - Async Python 3.12          │
                    │  - JWT Authentication         │
                    │  - RBAC Middleware             │
                    │  - Pydantic V2 Schemas        │
                    │  - Anomaly Detection (ML)     │
                    └──────┬──────────┬────────────┘
                           │          │
              ┌────────────▼──┐  ┌───▼──────────────┐
              │  PostgreSQL   │  │     Redis         │
              │  (TimescaleDB)│  │  (Cache/Queue)    │
              │  - Users      │  │  - Session cache  │
              │  - Projects   │  │  - Task queue     │
              │  - Metrics    │  └───────────────────┘
              │  - Alerts     │
              │  - Quality    │
              └───────────────┘

External Integrations:
  - IoT Sensors → POST /api/v1/metrics/batch
  - CSV/Excel  → POST /api/v1/metrics/upload/csv
  - SMS        → Alert notification service
  - Email      → Alert notification service
```

## Data Model (ERD)

```
┌──────────────┐    ┌───────────────┐    ┌──────────────────┐
│   tenants    │    │    users      │    │   user_tenants   │
│──────────────│    │───────────────│    │──────────────────│
│ id (PK)      │◄──┤ id (PK)       │◄──┤ user_id (FK)     │
│ name         │    │ email         │    │ tenant_id (FK)   │
│ code         │    │ full_name     │    └──────────────────┘
│ region       │    │ role          │
│ is_active    │    │ hashed_password│
└──────┬───────┘    │ is_active     │
       │            └───────────────┘
       │
┌──────▼───────────┐    ┌─────────────────────┐
│ water_projects   │    │     metrics          │
│──────────────────│    │─────────────────────│
│ id (PK)          │◄──┤ id (PK)              │
│ name             │    │ project_id (FK)      │
│ project_code     │    │ sensor_id            │
│ project_type     │    │ metric_type          │
│ status           │    │ value                │
│ region/district  │    │ unit                 │
│ lat/lng          │    │ is_anomaly           │
│ capacity         │    │ anomaly_score        │
│ population       │    │ recorded_at (index)  │
│ tenant_id (FK)   │    └─────────────────────┘
└──────────────────┘
       │
       │    ┌─────────────────────────┐
       ├───▶│   alerts                │
       │    │─────────────────────────│
       │    │ id (PK)                 │
       │    │ project_id (FK)         │
       │    │ title/message           │
       │    │ severity                │
       │    │ status                  │
       │    │ metric_value/threshold  │
       │    └─────────────────────────┘
       │
       │    ┌─────────────────────────┐
       └───▶│ water_quality_readings  │
            │─────────────────────────│
            │ id (PK)                 │
            │ project_id (FK)         │
            │ ph, turbidity, chlorine │
            │ tds, conductivity       │
            │ is_compliant            │
            └─────────────────────────┘
```

## RBAC Permission Matrix

| Permission              | Minister | CEO | Manager | Operator | Analyst | Public |
|------------------------|----------|-----|---------|----------|---------|--------|
| view:national_dashboard | Yes      |     |         |          |         |        |
| view:regional_dashboard |          | Yes | Yes     |          | Yes     |        |
| view:site_dashboard     |          |     |         | Yes      |         |        |
| view:public_dashboard   |          |     |         |          |         | Yes    |
| view:kpis              | Yes      | Yes |         |          | Yes     |        |
| view:metrics           |          | Yes | Yes     | Yes      | Yes     |        |
| view:alerts            | Yes      | Yes | Yes     | Yes      |         |        |
| view:reports           | Yes      | Yes |         |          | Yes     |        |
| view:map               | Yes      | Yes | Yes     |          | Yes     | Yes    |
| create:metrics         |          |     |         | Yes      |         |        |
| create:readings        |          |     |         | Yes      |         |        |
| upload:data            |          |     |         | Yes      |         |        |
| export:reports         | Yes      | Yes | Yes     |          | Yes     |        |
| manage:projects        |          | Yes | Yes     |          |         |        |
| manage:users           | Yes      |     |         |          |         |        |
| manage:operators       |          | Yes |         |          |         |        |

## Developed By

**Rodden R. Chikonzo** & **Ernest Moyo** — 7Square Inc.
