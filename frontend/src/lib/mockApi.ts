/**
 * Mock API — serves demo data when the backend is unreachable.
 * Credentials are validated locally; all data is static/generated.
 */

import type { User, AuthTokens, WaterProject, Alert, DashboardKPIs, RegionSummary, Metric } from "@/types";

// ---------------------------------------------------------------------------
// Demo credentials
// ---------------------------------------------------------------------------
const DEMO_USERS: Record<string, { password: string; user: User }> = {
  "minister@maji.go.tz": {
    password: "minister123",
    user: { id: 1, email: "minister@maji.go.tz", full_name: "Hon. Jumanne Sagini", role: "minister", is_active: true, region: "National", created_at: "2024-01-01T00:00:00Z" },
  },
  "ceo@dawasa.go.tz": {
    password: "ceo123",
    user: { id: 2, email: "ceo@dawasa.go.tz", full_name: "Eng. Cyprian Luhemeja", role: "ceo", is_active: true, region: "Dar es Salaam", created_at: "2024-01-01T00:00:00Z" },
  },
  "manager@dawasa.go.tz": {
    password: "manager123",
    user: { id: 3, email: "manager@dawasa.go.tz", full_name: "Amina Mwakasole", role: "manager", is_active: true, region: "Dar es Salaam", created_at: "2024-01-01T00:00:00Z" },
  },
  "operator@dawasa.go.tz": {
    password: "operator123",
    user: { id: 4, email: "operator@dawasa.go.tz", full_name: "John Kihamba", role: "operator", is_active: true, region: "Dar es Salaam", created_at: "2024-01-01T00:00:00Z" },
  },
  "analyst@maji.go.tz": {
    password: "analyst123",
    user: { id: 5, email: "analyst@maji.go.tz", full_name: "Fatuma Nassoro", role: "analyst", is_active: true, region: "National", created_at: "2024-01-01T00:00:00Z" },
  },
  "public@example.com": {
    password: "public123",
    user: { id: 6, email: "public@example.com", full_name: "Mwananchi User", role: "public", is_active: true, created_at: "2024-01-01T00:00:00Z" },
  },
};

// ---------------------------------------------------------------------------
// Mock token helpers
// ---------------------------------------------------------------------------
export const MOCK_TOKEN_PREFIX = "mock:";

export function makeMockToken(email: string): string {
  return MOCK_TOKEN_PREFIX + btoa(email);
}

export function emailFromMockToken(token: string): string | null {
  if (!token.startsWith(MOCK_TOKEN_PREFIX)) return null;
  try { return atob(token.slice(MOCK_TOKEN_PREFIX.length)); } catch { return null; }
}

export function isMockToken(token: string | null): boolean {
  return !!token?.startsWith(MOCK_TOKEN_PREFIX);
}

// ---------------------------------------------------------------------------
// Handler: POST /auth/login
// ---------------------------------------------------------------------------
export function mockLogin(email: string, password: string): AuthTokens {
  const entry = DEMO_USERS[email.toLowerCase()];
  if (!entry || entry.password !== password) {
    throw Object.assign(new Error("Invalid email or password"), { status: 401 });
  }
  const token = makeMockToken(email.toLowerCase());
  return { access_token: token, refresh_token: token, token_type: "bearer" };
}

// ---------------------------------------------------------------------------
// Handler: GET /users/me
// ---------------------------------------------------------------------------
export function mockGetCurrentUser(token: string): User {
  const email = emailFromMockToken(token);
  const entry = email ? DEMO_USERS[email] : null;
  if (!entry) throw Object.assign(new Error("Unauthorized"), { status: 401 });
  return entry.user;
}

// ---------------------------------------------------------------------------
// Static mock data
// ---------------------------------------------------------------------------
const PROJECTS: WaterProject[] = [
  { id: 1, name: "Ruvu Lower Water Treatment Plant", project_code: "TZ-WP-0001", project_type: "pump_station", status: "operational", region: "Dar es Salaam", district: "Kinondoni", latitude: -6.7924, longitude: 39.2083, design_capacity_m3_per_day: 180000, current_capacity_m3_per_day: 162000, population_served: 2500000, connection_count: 450000, created_at: "2010-03-01T00:00:00Z" },
  { id: 2, name: "Ruvu Upper Intake", project_code: "TZ-WP-0002", project_type: "intake", status: "operational", region: "Dar es Salaam", district: "Ilala", latitude: -6.8162, longitude: 39.2894, design_capacity_m3_per_day: 82000, current_capacity_m3_per_day: 72000, population_served: 1000000, connection_count: 200000, created_at: "2008-06-01T00:00:00Z" },
  { id: 3, name: "Mtoni Distribution Center", project_code: "TZ-WP-0003", project_type: "distribution_network", status: "operational", region: "Dar es Salaam", district: "Temeke", latitude: -6.8502, longitude: 39.2699, design_capacity_m3_per_day: 45000, current_capacity_m3_per_day: 38000, population_served: 500000, connection_count: 120000, created_at: "2012-01-01T00:00:00Z" },
  { id: 4, name: "Kigamboni Water Supply", project_code: "TZ-WP-0004", project_type: "borehole", status: "maintenance", region: "Dar es Salaam", district: "Kigamboni", latitude: -6.8679, longitude: 39.3219, design_capacity_m3_per_day: 12000, current_capacity_m3_per_day: 8000, population_served: 150000, connection_count: 30000, created_at: "2015-09-01T00:00:00Z" },
  { id: 5, name: "Dodoma Urban Water Supply", project_code: "TZ-WP-0005", project_type: "treatment_plant", status: "operational", region: "Dodoma", district: "Dodoma Urban", latitude: -6.163, longitude: 35.7516, design_capacity_m3_per_day: 35000, current_capacity_m3_per_day: 29000, population_served: 400000, connection_count: 80000, created_at: "2011-04-01T00:00:00Z" },
  { id: 6, name: "Hombolo Dam", project_code: "TZ-WP-0006", project_type: "dam", status: "operational", region: "Dodoma", district: "Chamwino", latitude: -5.9562, longitude: 35.9601, design_capacity_m3_per_day: 50000, current_capacity_m3_per_day: 44000, population_served: 300000, connection_count: 50000, created_at: "2009-11-01T00:00:00Z" },
  { id: 7, name: "Arusha Town Water Supply", project_code: "TZ-WP-0007", project_type: "treatment_plant", status: "operational", region: "Arusha", district: "Arusha City", latitude: -3.3869, longitude: 36.683, design_capacity_m3_per_day: 40000, current_capacity_m3_per_day: 34000, population_served: 500000, connection_count: 95000, created_at: "2013-07-01T00:00:00Z" },
  { id: 8, name: "Mount Meru Spring Intake", project_code: "TZ-WP-0008", project_type: "intake", status: "operational", region: "Arusha", district: "Meru", latitude: -3.2464, longitude: 36.7521, design_capacity_m3_per_day: 20000, current_capacity_m3_per_day: 17000, population_served: 200000, connection_count: 40000, created_at: "2007-02-01T00:00:00Z" },
  { id: 9, name: "Mwanza City Water System", project_code: "TZ-WP-0009", project_type: "treatment_plant", status: "operational", region: "Mwanza", district: "Nyamagana", latitude: -2.5164, longitude: 32.9176, design_capacity_m3_per_day: 55000, current_capacity_m3_per_day: 46000, population_served: 700000, connection_count: 130000, created_at: "2014-05-01T00:00:00Z" },
  { id: 10, name: "Lake Victoria Intake", project_code: "TZ-WP-0010", project_type: "intake", status: "operational", region: "Mwanza", district: "Ilemela", latitude: -2.4833, longitude: 32.8833, design_capacity_m3_per_day: 80000, current_capacity_m3_per_day: 68000, population_served: 1000000, connection_count: 180000, created_at: "2010-08-01T00:00:00Z" },
  { id: 11, name: "Tanga Urban Supply", project_code: "TZ-WP-0011", project_type: "treatment_plant", status: "operational", region: "Tanga", district: "Tanga City", latitude: -5.0689, longitude: 39.099, design_capacity_m3_per_day: 25000, current_capacity_m3_per_day: 21000, population_served: 300000, connection_count: 55000, created_at: "2016-03-01T00:00:00Z" },
  { id: 12, name: "Pangani River Intake", project_code: "TZ-WP-0012", project_type: "intake", status: "under_construction", region: "Tanga", district: "Pangani", latitude: -5.8334, longitude: 38.5748, design_capacity_m3_per_day: 15000, current_capacity_m3_per_day: 10000, population_served: 120000, connection_count: 25000, created_at: "2022-01-01T00:00:00Z" },
  { id: 13, name: "Morogoro Municipal Water", project_code: "TZ-WP-0013", project_type: "treatment_plant", status: "operational", region: "Morogoro", district: "Morogoro", latitude: -6.8235, longitude: 37.661, design_capacity_m3_per_day: 30000, current_capacity_m3_per_day: 25000, population_served: 350000, connection_count: 70000, created_at: "2013-10-01T00:00:00Z" },
  { id: 14, name: "Moshi Water Supply", project_code: "TZ-WP-0014", project_type: "treatment_plant", status: "operational", region: "Kilimanjaro", district: "Moshi", latitude: -3.335, longitude: 37.3404, design_capacity_m3_per_day: 22000, current_capacity_m3_per_day: 19000, population_served: 280000, connection_count: 55000, created_at: "2011-12-01T00:00:00Z" },
  { id: 15, name: "Mbeya City Water System", project_code: "TZ-WP-0015", project_type: "treatment_plant", status: "operational", region: "Mbeya", district: "Mbeya City", latitude: -8.9, longitude: 33.46, design_capacity_m3_per_day: 28000, current_capacity_m3_per_day: 23000, population_served: 380000, connection_count: 75000, created_at: "2012-06-01T00:00:00Z" },
];

const ALERTS: Alert[] = [
  { id: 1, project_id: 1, title: "High pressure detected at Ruvu Lower", message: "Pressure reading 8.5 bar exceeds threshold of 7 bar", severity: "warning", status: "active", alert_type: "pressure_drop", metric_type: "pressure", metric_value: 8.5, threshold_value: 7.0, created_at: new Date(Date.now() - 2 * 3600_000).toISOString() },
  { id: 2, project_id: 4, title: "Possible leak at Kigamboni", message: "Flow rate anomaly detected: sudden 40% increase", severity: "critical", status: "active", alert_type: "leak", metric_type: "flow", metric_value: 180.5, threshold_value: 120.0, created_at: new Date(Date.now() - 5 * 3600_000).toISOString() },
  { id: 3, project_id: 5, title: "Water quality non-compliance", message: "Turbidity reading 6.2 NTU exceeds WHO standard of 5 NTU", severity: "warning", status: "active", alert_type: "quality", metric_type: "turbidity", metric_value: 6.2, threshold_value: 5.0, created_at: new Date(Date.now() - 8 * 3600_000).toISOString() },
  { id: 4, project_id: 9, title: "Low pressure in Mwanza distribution", message: "Pressure dropped to 0.8 bar, below minimum 1.5 bar", severity: "critical", status: "active", alert_type: "pressure_drop", metric_type: "pressure", metric_value: 0.8, threshold_value: 1.5, created_at: new Date(Date.now() - 12 * 3600_000).toISOString() },
  { id: 5, project_id: 7, title: "Chlorine levels low at Arusha", message: "Chlorine at 0.15 mg/L, below minimum 0.2 mg/L", severity: "warning", status: "acknowledged", alert_type: "quality", metric_type: "chlorine", metric_value: 0.15, threshold_value: 0.2, created_at: new Date(Date.now() - 24 * 3600_000).toISOString() },
];

const KPIS: DashboardKPIs = {
  total_projects: 15,
  operational_projects: 12,
  total_population_served: 8680000,
  total_connections: 1605000,
  avg_flow_rate_ls: 87.4,
  avg_pressure_bar: 3.8,
  active_alerts: 4,
  nrw_percentage: 23.5,
  water_quality_compliance_pct: 91.2,
};

const REGIONS: RegionSummary[] = [
  { region: "Dar es Salaam", project_count: 4, population_served: 4150000 },
  { region: "Dodoma", project_count: 2, population_served: 700000 },
  { region: "Arusha", project_count: 2, population_served: 700000 },
  { region: "Mwanza", project_count: 2, population_served: 1700000 },
  { region: "Tanga", project_count: 2, population_served: 420000 },
  { region: "Morogoro", project_count: 1, population_served: 350000 },
  { region: "Kilimanjaro", project_count: 1, population_served: 280000 },
  { region: "Mbeya", project_count: 1, population_served: 380000 },
];

function generateMetrics(projectId: number): Metric[] {
  const now = Date.now();
  const metrics: Metric[] = [];
  for (let h = 0; h < 48; h++) {
    const ts = new Date(now - h * 3600_000).toISOString();
    metrics.push({ id: projectId * 1000 + h * 2, project_id: projectId, sensor_id: `FLOW-TZ-WP-${String(projectId).padStart(4,"0")}`, metric_type: "flow", value: +(55 + Math.sin(h / 4) * 15 + Math.random() * 5).toFixed(2), unit: "L/s", is_anomaly: false, recorded_at: ts });
    metrics.push({ id: projectId * 1000 + h * 2 + 1, project_id: projectId, sensor_id: `PRESS-TZ-WP-${String(projectId).padStart(4,"0")}`, metric_type: "pressure", value: +(3.5 + Math.sin(h / 6) * 0.8 + Math.random() * 0.3).toFixed(2), unit: "bar", is_anomaly: false, recorded_at: ts });
  }
  return metrics;
}

// ---------------------------------------------------------------------------
// Route dispatcher — returns mock response body for a given method + URL path
// ---------------------------------------------------------------------------
export function dispatchMock(method: string, url: string, data?: unknown, token?: string | null): unknown {
  const m = method.toUpperCase();
  // Strip query strings for matching
  const path = url.split("?")[0].replace(/\/api\/v1/, "");

  // Auth
  if (m === "POST" && path === "/auth/login") {
    const { email, password } = data as { email: string; password: string };
    return mockLogin(email, password);
  }
  if (m === "POST" && path === "/auth/refresh") {
    const { refresh_token } = data as { refresh_token: string };
    if (!isMockToken(refresh_token)) throw Object.assign(new Error("Invalid token"), { status: 401 });
    return { access_token: refresh_token, refresh_token, token_type: "bearer" };
  }

  // Users
  if (m === "GET" && path === "/users/me") {
    return mockGetCurrentUser(token ?? "");
  }

  // Dashboard
  if (m === "GET" && path === "/dashboard/kpis") return KPIS;
  if (m === "GET" && path === "/dashboard/regions") return REGIONS;

  // Alerts
  if (m === "GET" && path === "/alerts") return ALERTS;

  // Projects
  if (m === "GET" && path === "/projects/map") return PROJECTS;
  if (m === "GET" && path === "/projects") return { items: PROJECTS, total: PROJECTS.length };
  const projectMatch = path.match(/^\/projects\/(\d+)$/);
  if (m === "GET" && projectMatch) {
    const p = PROJECTS.find((x) => x.id === Number(projectMatch[1]));
    if (!p) throw Object.assign(new Error("Not found"), { status: 404 });
    return p;
  }
  const metricsMatch = path.match(/^\/projects\/(\d+)\/metrics/);
  if (m === "GET" && metricsMatch) {
    return generateMetrics(Number(metricsMatch[1]));
  }

  // Fallback — empty success
  return {};
}
