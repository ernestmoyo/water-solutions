import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import ProjectMap from "@/components/Maps/ProjectMap";
import type { WaterProject } from "@/types";
import { Loader2 } from "lucide-react";

export default function MapPage() {
  const { data: projects, isLoading } = useQuery<WaterProject[]>({
    queryKey: ["map-projects"],
    queryFn: () => api.get("/projects/map").then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Water Projects Map</h1>
        <p className="text-sm text-gray-500">
          Geospatial view of {projects?.length ?? 0} water infrastructure sites across Tanzania
        </p>
      </div>

      {/* Legend */}
      <div className="card flex flex-wrap gap-4 py-3">
        {[
          { label: "Operational", color: "#22c55e" },
          { label: "Maintenance", color: "#f59e0b" },
          { label: "Under Construction", color: "#3b82f6" },
          { label: "Planning", color: "#a855f7" },
          { label: "Decommissioned", color: "#ef4444" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-gray-600">
            <div
              className="h-3 w-3 rounded-full border-2 border-white shadow"
              style={{ background: color }}
            />
            {label}
          </div>
        ))}
      </div>

      {projects && <ProjectMap projects={projects} height="calc(100vh - 260px)" />}
    </div>
  );
}
