export type Role = "minister" | "ceo" | "manager" | "operator" | "analyst" | "public";

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: Role;
  is_active: boolean;
  phone?: string;
  region?: string;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface WaterProject {
  id: number;
  name: string;
  project_code: string;
  project_type: string;
  status: string;
  description?: string;
  region: string;
  district: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  design_capacity_m3_per_day?: number;
  current_capacity_m3_per_day?: number;
  population_served?: number;
  connection_count?: number;
  tenant_id?: number;
  created_at: string;
}

export interface Metric {
  id: number;
  project_id: number;
  sensor_id?: string;
  metric_type: string;
  value: number;
  unit: string;
  is_anomaly: boolean;
  anomaly_score?: number;
  quality_flag?: string;
  recorded_at: string;
}

export interface Alert {
  id: number;
  project_id: number;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical" | "emergency";
  status: "active" | "acknowledged" | "resolved";
  alert_type: string;
  metric_type?: string;
  metric_value?: number;
  threshold_value?: number;
  created_at: string;
}

export interface DashboardKPIs {
  total_projects: number;
  operational_projects: number;
  total_population_served: number;
  total_connections: number;
  avg_flow_rate_ls: number;
  avg_pressure_bar: number;
  active_alerts: number;
  nrw_percentage: number;
  water_quality_compliance_pct: number;
}

export interface RegionSummary {
  region: string;
  project_count: number;
  population_served: number;
}
