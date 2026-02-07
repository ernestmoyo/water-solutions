import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface DataPoint {
  period: string;
  avg_value: number;
  min_value: number;
  max_value: number;
}

interface Props {
  data: DataPoint[];
  title: string;
  unit: string;
  color?: string;
}

export default function FlowChart({ data, title, unit, color = "#0ea5e9" }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    time: new Date(d.period).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} unit={` ${unit}`} />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(value: number) => [`${value.toFixed(2)} ${unit}`, ""]}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="avg_value"
              name="Average"
              stroke={color}
              fillOpacity={1}
              fill={`url(#grad-${title})`}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="max_value"
              name="Max"
              stroke="#94a3b8"
              fill="none"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <Area
              type="monotone"
              dataKey="min_value"
              name="Min"
              stroke="#cbd5e1"
              fill="none"
              strokeDasharray="4 4"
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
