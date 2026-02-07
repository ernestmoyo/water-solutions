import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import FlowChart from "@/components/Charts/FlowChart";
import AlertList from "@/components/Alerts/AlertList";
import type { WaterProject, Metric, Alert } from "@/types";
import { Droplets, MapPin, Users, Gauge, Calendar, Loader2 } from "lucide-react";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: project, isLoading } = useQuery<WaterProject>({
    queryKey: ["project", id],
    queryFn: () => api.get(`/projects/${id}`).then((r) => r.data),
  });

  const { data: latestMetrics } = useQuery<Metric[]>({
    queryKey: ["project-latest", id],
    queryFn: () => api.get(`/metrics/${id}/latest`).then((r) => r.data),
    enabled: !!id,
  });

  const { data: flowData } = useQuery({
    queryKey: ["project-flow", id],
    queryFn: () =>
      api
        .get(`/metrics/${id}/aggregated`, {
          params: { metric_type: "flow", interval: "1 hour" },
        })
        .then((r) => r.data),
    enabled: !!id,
  });

  const { data: pressureData } = useQuery({
    queryKey: ["project-pressure", id],
    queryFn: () =>
      api
        .get(`/metrics/${id}/aggregated`, {
          params: { metric_type: "pressure", interval: "1 hour" },
        })
        .then((r) => r.data),
    enabled: !!id,
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ["project-alerts", id],
    queryFn: () =>
      api.get("/alerts", { params: { project_id: id } }).then((r) => r.data),
    enabled: !!id,
  });

  if (isLoading || !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Droplets className="h-6 w-6 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">{project.project_code}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="badge-success">{project.status.replace(/_/g, " ")}</span>
            <span className="badge-info">{project.project_type.replace(/_/g, " ")}</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="h-4 w-4" />
            {project.region}, {project.district}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            {project.population_served?.toLocaleString() || "—"} served
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Gauge className="h-4 w-4" />
            {project.current_capacity_m3_per_day?.toLocaleString() || "—"} m&sup3;/day
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            {project.connection_count?.toLocaleString() || "—"} connections
          </div>
        </div>
      </div>

      {/* Latest sensor readings */}
      {latestMetrics && latestMetrics.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {latestMetrics.map((m) => (
            <div key={m.id} className="card text-center">
              <p className="text-xs text-gray-500 capitalize">
                {m.metric_type.replace(/_/g, " ")}
              </p>
              <p className="text-2xl font-bold text-gray-800 mt-1">
                {m.value.toFixed(1)}
              </p>
              <p className="text-xs text-gray-400">{m.unit}</p>
              {m.is_anomaly && (
                <span className="badge-danger mt-2 text-xs">Anomaly</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Time-series charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {flowData && flowData.length > 0 && (
          <FlowChart data={flowData} title="Flow Rate (7d)" unit="L/s" color="#0ea5e9" />
        )}
        {pressureData && pressureData.length > 0 && (
          <FlowChart
            data={pressureData}
            title="Pressure (7d)"
            unit="bar"
            color="#f59e0b"
          />
        )}
      </div>

      {/* Alerts for this project */}
      {alerts && alerts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Project Alerts</h3>
          <AlertList alerts={alerts} />
        </div>
      )}
    </div>
  );
}
