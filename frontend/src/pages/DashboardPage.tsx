import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import KPICards from "@/components/Dashboard/KPICards";
import FlowChart from "@/components/Charts/FlowChart";
import RegionBarChart from "@/components/Charts/RegionBarChart";
import AlertList from "@/components/Alerts/AlertList";
import ProjectMap from "@/components/Maps/ProjectMap";
import type { DashboardKPIs, RegionSummary, Alert, WaterProject } from "@/types";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: kpis, isLoading: loadingKpis } = useQuery<DashboardKPIs>({
    queryKey: ["kpis"],
    queryFn: () => api.get("/dashboard/kpis").then((r) => r.data),
  });

  const { data: regions } = useQuery<RegionSummary[]>({
    queryKey: ["regions"],
    queryFn: () => api.get("/dashboard/regions").then((r) => r.data),
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["alerts"],
    queryFn: () => api.get("/alerts", { params: { limit: 5 } }).then((r) => r.data),
  });

  const { data: mapProjects } = useQuery<WaterProject[]>({
    queryKey: ["map-projects"],
    queryFn: () => api.get("/projects/map").then((r) => r.data),
  });

  if (loadingKpis) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {user?.role === "minister"
            ? "National Overview"
            : user?.role === "ceo"
              ? `Regional Operations — ${user?.region || ""}`
              : "Dashboard"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome back, {user?.full_name}. Here&apos;s your water infrastructure overview.
        </p>
      </div>

      {/* KPI Cards */}
      {kpis && <KPICards kpis={kpis} />}

      {/* Charts & Map row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        {mapProjects && (
          <ProjectMap projects={mapProjects} height="400px" />
        )}

        {/* Region chart */}
        {regions && <RegionBarChart data={regions} />}
      </div>

      {/* Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Alerts</h3>
          {alerts && <AlertList alerts={alerts} compact />}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            {kpis && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Operational Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${(kpis.operational_projects / kpis.total_projects) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {((kpis.operational_projects / kpis.total_projects) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Water Quality Compliance</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${kpis.water_quality_compliance_pct}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {kpis.water_quality_compliance_pct.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Non-Revenue Water</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-400 rounded-full"
                        style={{ width: `${kpis.nrw_percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{kpis.nrw_percentage.toFixed(0)}%</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
