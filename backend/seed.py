"""Seed database with sample Tanzania water project data."""

import asyncio
import random
from datetime import datetime, timezone, timedelta

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.config import get_settings
from app.core.security import hash_password
from app.models.user import User
from app.models.project import WaterProject, Tenant
from app.models.metric import Metric, WaterQualityReading
from app.models.alert import Alert, AlertRule

settings = get_settings()

engine = create_async_engine(str(settings.DATABASE_URL), echo=True)

TANZANIA_REGIONS = [
    "Dar es Salaam", "Dodoma", "Arusha", "Mwanza", "Tanga",
    "Morogoro", "Kilimanjaro", "Mbeya", "Iringa", "Kagera",
    "Lindi", "Mtwara", "Ruvuma", "Shinyanga", "Tabora",
    "Singida", "Rukwa", "Kigoma", "Pwani", "Mara",
    "Manyara", "Njombe", "Geita", "Simiyu", "Katavi", "Songwe",
]

DISTRICTS = {
    "Dar es Salaam": ["Ilala", "Kinondoni", "Temeke", "Kigamboni", "Ubungo"],
    "Dodoma": ["Dodoma Urban", "Chamwino", "Kondoa", "Mpwapwa", "Bahi"],
    "Arusha": ["Arusha City", "Monduli", "Meru", "Karatu", "Longido"],
    "Mwanza": ["Nyamagana", "Ilemela", "Sengerema", "Kwimba", "Magu"],
    "Tanga": ["Tanga City", "Muheza", "Pangani", "Korogwe", "Lushoto"],
}


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.drop_all)
        await conn.run_sync(SQLModel.metadata.create_all)

    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # --- Tenants ---
        tenants = [
            Tenant(name="DAWASA", code="DAWASA", region="Dar es Salaam",
                   contact_email="info@dawasa.go.tz"),
            Tenant(name="DUWASA", code="DUWASA", region="Dodoma",
                   contact_email="info@duwasa.go.tz"),
            Tenant(name="AUWSA", code="AUWSA", region="Arusha",
                   contact_email="info@auwsa.go.tz"),
            Tenant(name="MWAUWASA", code="MWAUWASA", region="Mwanza",
                   contact_email="info@mwauwasa.go.tz"),
            Tenant(name="TUWASA", code="TUWASA", region="Tanga",
                   contact_email="info@tuwasa.go.tz"),
        ]
        session.add_all(tenants)
        await session.flush()

        # --- Users ---
        users = [
            User(email="minister@maji.go.tz", full_name="Hon. Jumanne Sagini",
                 hashed_password=hash_password("minister123"), role="minister",
                 region="National"),
            User(email="ceo@dawasa.go.tz", full_name="Eng. Cyprian Luhemeja",
                 hashed_password=hash_password("ceo123"), role="ceo",
                 region="Dar es Salaam"),
            User(email="manager@dawasa.go.tz", full_name="Amina Mwakasole",
                 hashed_password=hash_password("manager123"), role="manager",
                 region="Dar es Salaam"),
            User(email="operator@dawasa.go.tz", full_name="John Kihamba",
                 hashed_password=hash_password("operator123"), role="operator",
                 region="Dar es Salaam"),
            User(email="analyst@maji.go.tz", full_name="Fatuma Nassoro",
                 hashed_password=hash_password("analyst123"), role="analyst",
                 region="National"),
            User(email="public@example.com", full_name="Mwananchi User",
                 hashed_password=hash_password("public123"), role="public"),
        ]
        session.add_all(users)
        await session.flush()

        # --- Water Projects ---
        project_templates = [
            ("Ruvu Lower Water Treatment Plant", "pump_station", "Dar es Salaam", "Kinondoni", -6.7924, 39.2083, 180000, 2500000, 450000),
            ("Ruvu Upper Intake", "intake", "Dar es Salaam", "Ilala", -6.8162, 39.2894, 82000, 1000000, 200000),
            ("Mtoni Distribution Center", "distribution_network", "Dar es Salaam", "Temeke", -6.8502, 39.2699, 45000, 500000, 120000),
            ("Kigamboni Water Supply", "borehole", "Dar es Salaam", "Kigamboni", -6.8679, 39.3219, 12000, 150000, 30000),
            ("Dodoma Urban Water Supply", "treatment_plant", "Dodoma", "Dodoma Urban", -6.1630, 35.7516, 35000, 400000, 80000),
            ("Hombolo Dam", "dam", "Dodoma", "Chamwino", -5.9562, 35.9601, 50000, 300000, 50000),
            ("Arusha Town Water Supply", "treatment_plant", "Arusha", "Arusha City", -3.3869, 36.6830, 40000, 500000, 95000),
            ("Mount Meru Spring Intake", "intake", "Arusha", "Meru", -3.2464, 36.7521, 20000, 200000, 40000),
            ("Mwanza City Water System", "treatment_plant", "Mwanza", "Nyamagana", -2.5164, 32.9176, 55000, 700000, 130000),
            ("Lake Victoria Intake", "intake", "Mwanza", "Ilemela", -2.4833, 32.8833, 80000, 1000000, 180000),
            ("Tanga Urban Supply", "treatment_plant", "Tanga", "Tanga City", -5.0689, 39.0990, 25000, 300000, 55000),
            ("Pangani River Intake", "intake", "Tanga", "Pangani", -5.8334, 38.5748, 15000, 120000, 25000),
            ("Morogoro Municipal Water", "treatment_plant", "Morogoro", "Morogoro", -6.8235, 37.6610, 30000, 350000, 70000),
            ("Moshi Water Supply", "treatment_plant", "Kilimanjaro", "Moshi", -3.3350, 37.3404, 22000, 280000, 55000),
            ("Mbeya City Water System", "treatment_plant", "Mbeya", "Mbeya City", -8.9000, 33.4600, 28000, 380000, 75000),
        ]

        projects = []
        for i, (name, ptype, region, district, lat, lon, capacity, pop, conns) in enumerate(project_templates, 1):
            p = WaterProject(
                name=name,
                project_code=f"TZ-WP-{i:04d}",
                project_type=ptype,
                status="operational",
                region=region,
                district=district,
                latitude=lat,
                longitude=lon,
                design_capacity_m3_per_day=capacity,
                current_capacity_m3_per_day=int(capacity * random.uniform(0.6, 0.95)),
                population_served=pop,
                connection_count=conns,
                tenant_id=tenants[min(i - 1, len(tenants) - 1) % len(tenants)].id,
                commissioned_date=datetime(
                    random.randint(2005, 2023), random.randint(1, 12), 1, tzinfo=timezone.utc
                ),
            )
            projects.append(p)
        session.add_all(projects)
        await session.flush()

        # --- Metrics (simulated time-series, last 7 days) ---
        now = datetime.now(timezone.utc)
        metrics = []
        for project in projects:
            for hours_ago in range(0, 168, 1):  # 7 days hourly
                ts = now - timedelta(hours=hours_ago)

                # Flow rate (L/s)
                base_flow = random.uniform(20, 200)
                flow_noise = random.gauss(0, base_flow * 0.05)
                metrics.append(Metric(
                    project_id=project.id,
                    sensor_id=f"FLOW-{project.project_code}",
                    metric_type="flow",
                    value=round(max(0, base_flow + flow_noise), 2),
                    unit="L/s",
                    recorded_at=ts,
                ))

                # Pressure (bar)
                base_pressure = random.uniform(2, 6)
                pressure_noise = random.gauss(0, 0.2)
                metrics.append(Metric(
                    project_id=project.id,
                    sensor_id=f"PRESS-{project.project_code}",
                    metric_type="pressure",
                    value=round(max(0.1, base_pressure + pressure_noise), 2),
                    unit="bar",
                    recorded_at=ts,
                ))

                # Water level (m) - every 3 hours
                if hours_ago % 3 == 0:
                    metrics.append(Metric(
                        project_id=project.id,
                        sensor_id=f"LEVEL-{project.project_code}",
                        metric_type="level",
                        value=round(random.uniform(2, 25), 2),
                        unit="m",
                        recorded_at=ts,
                    ))

        session.add_all(metrics)
        await session.flush()

        # --- Water Quality Readings ---
        quality_readings = []
        for project in projects[:8]:  # Quality for major plants
            for day in range(7):
                ts = now - timedelta(days=day)
                quality_readings.append(WaterQualityReading(
                    project_id=project.id,
                    sensor_id=f"QUAL-{project.project_code}",
                    ph=round(random.uniform(6.5, 8.0), 1),
                    turbidity_ntu=round(random.uniform(0.5, 4.5), 1),
                    chlorine_mg_l=round(random.uniform(0.3, 2.0), 2),
                    tds_mg_l=round(random.uniform(100, 600), 0),
                    conductivity_us_cm=round(random.uniform(200, 800), 0),
                    temperature_c=round(random.uniform(22, 28), 1),
                    is_compliant=random.random() > 0.1,
                    recorded_at=ts,
                ))
        session.add_all(quality_readings)
        await session.flush()

        # --- Alerts ---
        alerts = [
            Alert(
                project_id=projects[0].id,
                title="High pressure detected at Ruvu Lower",
                message="Pressure reading 8.5 bar exceeds threshold of 7 bar",
                severity="warning",
                status="active",
                alert_type="pressure_drop",
                metric_type="pressure",
                metric_value=8.5,
                threshold_value=7.0,
            ),
            Alert(
                project_id=projects[3].id,
                title="Possible leak at Kigamboni",
                message="Flow rate anomaly detected: sudden 40% increase",
                severity="critical",
                status="active",
                alert_type="leak",
                metric_type="flow",
                metric_value=180.5,
                threshold_value=120.0,
            ),
            Alert(
                project_id=projects[4].id,
                title="Water quality non-compliance",
                message="Turbidity reading 6.2 NTU exceeds WHO standard of 5 NTU",
                severity="warning",
                status="active",
                alert_type="quality",
                metric_type="turbidity",
                metric_value=6.2,
                threshold_value=5.0,
            ),
            Alert(
                project_id=projects[8].id,
                title="Low pressure in Mwanza distribution",
                message="Pressure dropped to 0.8 bar, below minimum 1.5 bar",
                severity="critical",
                status="active",
                alert_type="pressure_drop",
                metric_type="pressure",
                metric_value=0.8,
                threshold_value=1.5,
            ),
        ]
        session.add_all(alerts)

        # --- Alert Rules ---
        rules = [
            AlertRule(name="High Pressure Alert", metric_type="pressure",
                      condition="gt", threshold=7.0, severity="warning",
                      notify_email=True),
            AlertRule(name="Low Pressure Alert", metric_type="pressure",
                      condition="lt", threshold=1.0, severity="critical",
                      notify_email=True, notify_sms=True),
            AlertRule(name="High Turbidity", metric_type="turbidity",
                      condition="gt", threshold=5.0, severity="warning",
                      notify_email=True),
            AlertRule(name="Flow Anomaly", metric_type="flow",
                      condition="anomaly", severity="critical",
                      notify_email=True, notify_sms=True),
        ]
        session.add_all(rules)

        await session.commit()
        print("Seed data loaded successfully!")
        print(f"  Tenants: {len(tenants)}")
        print(f"  Users: {len(users)}")
        print(f"  Projects: {len(projects)}")
        print(f"  Metrics: {len(metrics)}")
        print(f"  Quality Readings: {len(quality_readings)}")
        print(f"  Alerts: {len(alerts)}")
        print(f"  Alert Rules: {len(rules)}")


if __name__ == "__main__":
    asyncio.run(seed())
