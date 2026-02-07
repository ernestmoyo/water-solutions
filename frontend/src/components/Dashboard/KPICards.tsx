import type { DashboardKPIs } from "@/types";
import {
  Droplets,
  Users,
  Gauge,
  AlertTriangle,
  Waves,
  PlugZap,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/cn";

interface Props {
  kpis: DashboardKPIs;
}

export default function KPICards({ kpis }: Props) {
  const cards = [
    {
      label: "Total Projects",
      value: kpis.total_projects.toLocaleString(),
      icon: Building2,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Operational",
      value: kpis.operational_projects.toLocaleString(),
      icon: Droplets,
      color: "text-green-600 bg-green-50",
      sub: `${((kpis.operational_projects / kpis.total_projects) * 100).toFixed(0)}%`,
    },
    {
      label: "Population Served",
      value:
        kpis.total_population_served >= 1_000_000
          ? `${(kpis.total_population_served / 1_000_000).toFixed(1)}M`
          : `${(kpis.total_population_served / 1_000).toFixed(0)}K`,
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: "Connections",
      value:
        kpis.total_connections >= 1_000_000
          ? `${(kpis.total_connections / 1_000_000).toFixed(1)}M`
          : `${(kpis.total_connections / 1_000).toFixed(0)}K`,
      icon: PlugZap,
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      label: "Avg Flow",
      value: `${kpis.avg_flow_rate_ls.toFixed(1)} L/s`,
      icon: Waves,
      color: "text-cyan-600 bg-cyan-50",
    },
    {
      label: "Avg Pressure",
      value: `${kpis.avg_pressure_bar.toFixed(1)} bar`,
      icon: Gauge,
      color: "text-orange-600 bg-orange-50",
    },
    {
      label: "Active Alerts",
      value: kpis.active_alerts.toString(),
      icon: AlertTriangle,
      color: kpis.active_alerts > 0 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50",
    },
    {
      label: "NRW",
      value: `${kpis.nrw_percentage.toFixed(1)}%`,
      icon: Droplets,
      color: kpis.nrw_percentage > 30 ? "text-red-600 bg-red-50" : "text-green-600 bg-green-50",
      sub: kpis.nrw_percentage > 30 ? "Above target" : "On target",
    },
    {
      label: "Quality Compliance",
      value: `${kpis.water_quality_compliance_pct.toFixed(1)}%`,
      icon: ShieldCheck,
      color: kpis.water_quality_compliance_pct >= 95
        ? "text-green-600 bg-green-50"
        : "text-yellow-600 bg-yellow-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map(({ label, value, icon: Icon, color, sub }) => (
        <div key={label} className="card flex items-start gap-3">
          <div className={cn("p-2.5 rounded-lg", color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
            <p className="text-xl font-bold text-gray-800">{value}</p>
            {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
