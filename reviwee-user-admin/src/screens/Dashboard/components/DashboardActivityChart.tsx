import { Paper, Typography } from "@mui/material";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const PIE_COLORS = ["#0081a7", "#94a3b8"];

type CategoryDatum = { name: string; count: number };

type Props = {
  activeCount: number;
  inactiveCount: number;
  categoryData: CategoryDatum[];
  showStatusPie?: boolean;
};

const DashboardActivityChart = ({
  activeCount,
  inactiveCount,
  categoryData,
  showStatusPie = true,
}: Props) => {
  const pieData = [
    { name: "Active", value: activeCount },
    { name: "Inactive", value: inactiveCount },
  ];
  const hasPie = showStatusPie && (activeCount > 0 || inactiveCount > 0);
  const barData = categoryData.filter((d) => d.count > 0).slice(0, 8);

  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
    >
      <Typography variant="subtitle1" className="font-semibold text-slate-900">
        Snapshot
      </Typography>
      <Typography variant="caption" className="text-slate-500">
        Status mix and top categories (sample of recent profiles)
      </Typography>

      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <div className="min-h-[220px]">
          {hasPie ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={72}
                  paddingAngle={2}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-500">
              Not enough status data for a chart.
            </div>
          )}
          {hasPie && (
            <div className="flex justify-center gap-4 text-xs text-slate-600">
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#0081a7]" />
                Active {activeCount}
              </span>
              <span>
                <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#94a3b8]" />
                Inactive {inactiveCount}
              </span>
            </div>
          )}
        </div>

        <div className="min-h-[220px]">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#64748b" }}
                  interval={0}
                  angle={-28}
                  textAnchor="end"
                  height={56}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Profiles" radius={[6, 6, 0, 0]} fill="var(--primary-main)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[220px] items-center justify-center rounded-xl bg-slate-50 text-center text-sm text-slate-500">
              No category breakdown for the current sample.
            </div>
          )}
        </div>
      </div>
    </Paper>
  );
};

export default DashboardActivityChart;
