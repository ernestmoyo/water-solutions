import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import AlertList from "@/components/Alerts/AlertList";
import type { Alert } from "@/types";
import { Loader2 } from "lucide-react";

export default function AlertsPage() {
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts-all"],
    queryFn: () => api.get("/alerts", { params: { limit: 200 } }).then((r) => r.data),
  });

  const ackMutation = useMutation({
    mutationFn: (id: number) => api.post(`/alerts/${id}/acknowledge`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts-all"] }),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.post(`/alerts/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts-all"] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const critical = alerts?.filter((a) => a.severity === "critical" || a.severity === "emergency") ?? [];
  const warnings = alerts?.filter((a) => a.severity === "warning") ?? [];
  const info = alerts?.filter((a) => a.severity === "info") ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Alerts</h1>
        <p className="text-sm text-gray-500">
          {alerts?.length ?? 0} active alerts across all projects
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card bg-red-50 border-red-200">
          <p className="text-xs font-medium text-red-600">Critical</p>
          <p className="text-2xl font-bold text-red-800">{critical.length}</p>
        </div>
        <div className="card bg-yellow-50 border-yellow-200">
          <p className="text-xs font-medium text-yellow-600">Warnings</p>
          <p className="text-2xl font-bold text-yellow-800">{warnings.length}</p>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <p className="text-xs font-medium text-blue-600">Info</p>
          <p className="text-2xl font-bold text-blue-800">{info.length}</p>
        </div>
      </div>

      {/* Critical alerts first */}
      {critical.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-700 mb-3">Critical Alerts</h3>
          <AlertList
            alerts={critical}
            onAcknowledge={(id) => ackMutation.mutate(id)}
            onResolve={(id) => resolveMutation.mutate(id)}
          />
        </div>
      )}

      {warnings.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-yellow-700 mb-3">Warnings</h3>
          <AlertList
            alerts={warnings}
            onAcknowledge={(id) => ackMutation.mutate(id)}
            onResolve={(id) => resolveMutation.mutate(id)}
          />
        </div>
      )}

      {info.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Informational</h3>
          <AlertList alerts={info} />
        </div>
      )}
    </div>
  );
}
