import { cn } from "@/lib/cn";
import type { Alert } from "@/types";
import { AlertTriangle, AlertCircle, Info, Siren } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const severityConfig = {
  info: { icon: Info, bg: "bg-blue-50 border-blue-200", text: "text-blue-700", badge: "badge-info" },
  warning: { icon: AlertTriangle, bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700", badge: "badge-warning" },
  critical: { icon: AlertCircle, bg: "bg-red-50 border-red-200", text: "text-red-700", badge: "badge-danger" },
  emergency: { icon: Siren, bg: "bg-red-100 border-red-300", text: "text-red-800", badge: "badge-danger" },
};

interface Props {
  alerts: Alert[];
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
  compact?: boolean;
}

export default function AlertList({ alerts, onAcknowledge, onResolve, compact }: Props) {
  if (alerts.length === 0) {
    return (
      <div className="card text-center py-8 text-gray-400">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No active alerts</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const config = severityConfig[alert.severity] || severityConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={alert.id}
            className={cn("rounded-lg border p-4", config.bg)}
          >
            <div className="flex items-start gap-3">
              <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.text)} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className={cn("font-medium text-sm", config.text)}>
                    {alert.title}
                  </h4>
                  <span className={config.badge}>{alert.severity}</span>
                  <span className="badge bg-gray-100 text-gray-600">
                    {alert.alert_type.replace(/_/g, " ")}
                  </span>
                </div>
                {!compact && (
                  <p className="text-xs text-gray-600 mt-1">{alert.message}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                  {alert.metric_value != null && (
                    <span className="text-xs text-gray-500">
                      Value: {alert.metric_value} | Threshold: {alert.threshold_value}
                    </span>
                  )}
                </div>
              </div>
              {alert.status === "active" && (
                <div className="flex gap-2 flex-shrink-0">
                  {onAcknowledge && (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="text-xs btn-secondary py-1 px-2"
                    >
                      Ack
                    </button>
                  )}
                  {onResolve && (
                    <button
                      onClick={() => onResolve(alert.id)}
                      className="text-xs btn-primary py-1 px-2"
                    >
                      Resolve
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
