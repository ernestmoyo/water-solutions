import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RegionSummary } from "@/types";

interface Props {
  data: RegionSummary[];
}

export default function RegionBarChart({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.project_count - a.project_count).slice(0, 15);

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">
        Projects by Region
      </h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sorted} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="region"
              tick={{ fontSize: 11 }}
              width={75}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === "project_count") return [value, "Projects"];
                return [value.toLocaleString(), "Population"];
              }}
            />
            <Bar dataKey="project_count" name="project_count" fill="#0369a1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
