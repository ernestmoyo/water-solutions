import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import type { RegionSummary } from "@/types";
import { FileText, Download } from "lucide-react";

export default function ReportsPage() {
  const { data: regions } = useQuery<RegionSummary[]>({
    queryKey: ["regions"],
    queryFn: () => api.get("/dashboard/regions").then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <p className="text-sm text-gray-500">
            Generate compliance and operational reports
          </p>
        </div>
      </div>

      {/* Report templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            title: "EWURA Compliance Report",
            desc: "Regulatory compliance summary per EWURA guidelines",
            icon: "compliance",
          },
          {
            title: "ESG Water Report (GRI 303)",
            desc: "Water withdrawal, discharge, and consumption metrics",
            icon: "esg",
          },
          {
            title: "Operational Summary",
            desc: "Monthly operational performance across all regions",
            icon: "ops",
          },
          {
            title: "Water Quality Report",
            desc: "pH, turbidity, chlorine levels vs. WHO/TBS standards",
            icon: "quality",
          },
          {
            title: "Non-Revenue Water Analysis",
            desc: "NRW breakdown: physical & commercial losses",
            icon: "nrw",
          },
          {
            title: "Alert History",
            desc: "Historical alert log with resolution times",
            icon: "alerts",
          },
        ].map((report) => (
          <div key={report.title} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-50 rounded-lg">
                <FileText className="h-5 w-5 text-primary-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-800">{report.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{report.desc}</p>
              </div>
            </div>
            <button className="mt-4 w-full btn-secondary text-xs flex items-center justify-center gap-2">
              <Download className="h-3.5 w-3.5" />
              Generate Report
            </button>
          </div>
        ))}
      </div>

      {/* Regional summary table */}
      {regions && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Regional Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-200">
                  <th className="pb-3 font-medium">Region</th>
                  <th className="pb-3 font-medium text-right">Projects</th>
                  <th className="pb-3 font-medium text-right">Population Served</th>
                </tr>
              </thead>
              <tbody>
                {regions
                  .sort((a, b) => b.project_count - a.project_count)
                  .map((r) => (
                    <tr
                      key={r.region}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2.5 font-medium text-gray-800">{r.region}</td>
                      <td className="py-2.5 text-right">{r.project_count}</td>
                      <td className="py-2.5 text-right">
                        {r.population_served.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
