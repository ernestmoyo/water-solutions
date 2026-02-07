import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import type { WaterProject } from "@/types";
import { Search, Droplets, MapPin, Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

const statusColors: Record<string, string> = {
  operational: "badge-success",
  maintenance: "badge-warning",
  under_construction: "badge-info",
  decommissioned: "badge-danger",
  planning: "bg-purple-100 text-purple-800",
};

export default function ProjectsPage() {
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery<{ items: WaterProject[]; total: number }>({
    queryKey: ["projects", regionFilter, statusFilter],
    queryFn: () =>
      api
        .get("/projects", {
          params: {
            limit: 100,
            ...(regionFilter && { region: regionFilter }),
            ...(statusFilter && { status: statusFilter }),
          },
        })
        .then((r) => r.data),
  });

  const filtered =
    data?.items.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.project_code.toLowerCase().includes(search.toLowerCase()) ||
        p.region.toLowerCase().includes(search.toLowerCase())
    ) ?? [];

  const regions = [...new Set(data?.items.map((p) => p.region) ?? [])].sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Water Projects</h1>
          <p className="text-sm text-gray-500">
            {data?.total ?? 0} projects across Tanzania
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
        >
          <option value="">All Statuses</option>
          <option value="operational">Operational</option>
          <option value="maintenance">Maintenance</option>
          <option value="under_construction">Under Construction</option>
          <option value="planning">Planning</option>
        </select>
      </div>

      {/* Project grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-primary-500" />
                  <h3 className="font-semibold text-sm text-gray-800 group-hover:text-primary-600">
                    {project.name}
                  </h3>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary-500" />
              </div>
              <p className="text-xs text-gray-400 mt-1">{project.project_code}</p>

              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className={cn("badge text-xs", statusColors[project.status] || "badge-info")}>
                  {project.status.replace(/_/g, " ")}
                </span>
                <span className="badge bg-gray-100 text-gray-600 text-xs">
                  {project.project_type.replace(/_/g, " ")}
                </span>
              </div>

              <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" />
                  {project.region}, {project.district}
                </div>
                {project.population_served && (
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    {project.population_served.toLocaleString()} people served
                  </div>
                )}
                {project.current_capacity_m3_per_day && (
                  <div className="flex items-center gap-1.5">
                    <Droplets className="h-3.5 w-3.5" />
                    {project.current_capacity_m3_per_day.toLocaleString()} m&sup3;/day
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
