# Izbezkal&#299; — National Water Infrastructure Dashboard

A comprehensive, role-based dashboard for monitoring all national water infrastructure projects across Tanzania. Built for the Ministry of Water, utility authorities (DAWASA, DUWASA, AUWSA, etc.), and public transparency.

**Developed by [Rodden R. Chikonzo](mailto:rodden@7squareinc.com) & [Ernest Moyo](mailto:ernest@7squareinc.com) | [7Square Inc.](https://7squareinc.com)**

---

## Features

- **Role-Based Access Control (RBAC)** — Minister (national KPIs), CEO (regional ops), Operators (site data entry), Analysts, Public
- **Real-Time Metrics** — Flow rate (L/s, m³/h), pressure (bar), water levels, energy consumption
- **Water Quality Monitoring** — pH, turbidity, chlorine, TDS with WHO/TBS compliance checking
- **Interactive Maps** — Geospatial view of all water projects across Tanzania's 26 regions
- **Time-Series Charts** — Flow trends, pressure history, aggregated metrics with Recharts
- **Anomaly Detection** — Rule-based + Isolation Forest ML for leak detection and pressure drops
- **Alert System** — Severity-based alerts (critical/warning/info) with acknowledge/resolve workflow
- **Multi-Tenant** — Support for multiple utilities (DAWASA, DUWASA, AUWSA, MWAUWASA, TUWASA)
- **Data Ingestion** — REST API, batch upload, CSV/Excel import for IoT/SCADA integration
- **Report Generation** — EWURA compliance, ESG/GRI 303, operational summaries
- **PWA-Ready** — Offline capable, mobile-responsive, installable on devices
- **Unit Conversion** — L/s ↔ m³/h, bar ↔ psi, and more

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React SPA     │────▶│   FastAPI         │────▶│  PostgreSQL     │
│   (Vite +       │     │   (Async API)     │     │  (TimescaleDB)  │
│    Tailwind)    │     │                   │────▶│  Redis          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
       │                        │
       │ Leaflet Maps           │ JWT Auth + RBAC
       │ Recharts               │ Pydantic V2
       │ TanStack Query         │ SQLModel
       │ Zustand                │ Anomaly Detection (sklearn)
```

## Tech Stack

| Layer     | Technology                                   |
|-----------|----------------------------------------------|
| Backend   | FastAPI, SQLModel, PostgreSQL + TimescaleDB   |
| Frontend  | React 18, Vite, Tailwind CSS, TypeScript      |
| Charts    | Recharts (time-series, bar, area)             |
| Maps      | Leaflet + React-Leaflet                       |
| Auth      | JWT (access + refresh tokens), RBAC           |
| State     | Zustand (client), TanStack Query (server)     |
| ML        | scikit-learn (Isolation Forest anomaly)       |
| Deploy    | Docker Compose, GitHub Actions CI             |

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & Docker Compose
- Git

### One-Command Setup

```bash
git clone https://github.com/ernestmoyo/water-solutions.git
cd water-solutions
cp .env.example .env
bash scripts/init.sh
```

### Manual Setup

```bash
# Start all services
docker compose up -d --build

# Wait for PostgreSQL, then seed
docker compose exec backend python seed.py

# Access
# API docs:  http://localhost:8000/docs
# Dashboard: http://localhost:3000
```

### Local Development (without Docker)

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## Demo Accounts

| Role     | Email                    | Password     |
|----------|--------------------------|--------------|
| Minister | minister@maji.go.tz      | minister123  |
| CEO      | ceo@dawasa.go.tz         | ceo123       |
| Manager  | manager@dawasa.go.tz     | manager123   |
| Operator | operator@dawasa.go.tz    | operator123  |
| Analyst  | analyst@maji.go.tz       | analyst123   |
| Public   | public@example.com       | public123    |

## API Endpoints

| Endpoint                     | Method | Description                          |
|------------------------------|--------|--------------------------------------|
| `/api/v1/auth/login`         | POST   | Login, get JWT tokens                |
| `/api/v1/auth/register`      | POST   | Register new account                 |
| `/api/v1/auth/refresh`       | POST   | Refresh access token                 |
| `/api/v1/users/me`           | GET    | Current user profile                 |
| `/api/v1/projects`           | GET    | List water projects (filterable)     |
| `/api/v1/projects/map`       | GET    | Projects with coordinates for map    |
| `/api/v1/projects/{id}`      | GET    | Single project details               |
| `/api/v1/metrics`            | POST   | Ingest single metric                 |
| `/api/v1/metrics/batch`      | POST   | Batch ingest (IoT/SCADA)            |
| `/api/v1/metrics/{id}/latest`| GET    | Latest readings per type             |
| `/api/v1/metrics/{id}/aggregated` | GET | Time-series aggregation         |
| `/api/v1/metrics/quality`    | POST   | Water quality reading                |
| `/api/v1/metrics/upload/csv` | POST   | CSV/Excel data upload                |
| `/api/v1/alerts`             | GET    | Active alerts                        |
| `/api/v1/alerts/{id}/acknowledge` | POST | Acknowledge alert              |
| `/api/v1/alerts/{id}/resolve` | POST  | Resolve alert                        |
| `/api/v1/dashboard/kpis`     | GET    | National/regional KPIs               |
| `/api/v1/dashboard/regions`  | GET    | Per-region summary                   |

Full API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

## Project Structure

```
water-solutions/
├── backend/
│   ├── app/
│   │   ├── api/routes/     # Auth, users, projects, metrics, alerts, dashboard
│   │   ├── core/           # Config, security, RBAC, database
│   │   ├── crud/           # Database operations
│   │   ├── models/         # SQLModel ORM models
│   │   ├── schemas/        # Pydantic request/response schemas
│   │   ├── services/       # Anomaly detection, business logic
│   │   ├── utils/          # Unit conversions, helpers
│   │   └── main.py         # FastAPI app entry point
│   ├── tests/              # Pytest test suite
│   ├── alembic/            # Database migrations
│   ├── seed.py             # Sample Tanzania data seeder
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Dashboard, Charts, Maps, Alerts, Layout
│   │   ├── pages/          # Dashboard, Projects, Map, Alerts, Reports
│   │   ├── hooks/          # useAuth
│   │   ├── stores/         # Zustand auth store
│   │   ├── lib/            # API client, utilities
│   │   └── types/          # TypeScript interfaces
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
├── .github/workflows/ci.yml
└── scripts/init.sh
```

## Seed Data

The seeder populates the database with:

- **5 Utility tenants** — DAWASA, DUWASA, AUWSA, MWAUWASA, TUWASA
- **15 Water projects** — Treatment plants, intakes, boreholes, distribution networks across Dar es Salaam, Dodoma, Arusha, Mwanza, Tanga, Morogoro, Kilimanjaro, Mbeya
- **~7,500 metric readings** — 7 days of hourly flow, pressure, and water level data
- **56 water quality readings** — pH, turbidity, chlorine, TDS for major plants
- **4 active alerts** — Pressure anomalies, leak detection, quality non-compliance
- **4 alert rules** — Configurable thresholds for automated alerting

## Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm test
```

## Extending

### Adding IoT Sensor Endpoint

The batch metrics API (`POST /api/v1/metrics/batch`) accepts JSON payloads directly from IoT gateways:

```json
{
  "metrics": [
    { "project_id": 1, "sensor_id": "FLOW-001", "metric_type": "flow", "value": 45.2, "unit": "L/s" },
    { "project_id": 1, "sensor_id": "PRESS-001", "metric_type": "pressure", "value": 3.8, "unit": "bar" }
  ]
}
```

### Adding a New Region or Utility

1. Add tenant via API: `POST /api/v1/projects` with `tenant_id`
2. Or update `seed.py` with new tenant/project data
3. RBAC automatically scopes views by region/tenant

## Standards & Compliance

- **EWURA** — Energy and Water Utilities Regulatory Authority of Tanzania
- **WHO** — Drinking water quality guidelines (pH 6.5–8.5, turbidity < 5 NTU)
- **GRI 303** — ESG water reporting (withdrawal, discharge, consumption)
- **Tanzania Bureau of Standards** — TZS 789:2008 drinking water specification

## License

MIT License — see [LICENSE](LICENSE)

---

**Rodden R. Chikonzo** — rodden@7squareinc.com
**Ernest Moyo** — ernest@7squareinc.com
**7Square Inc.** — Building water infrastructure solutions for Africa
