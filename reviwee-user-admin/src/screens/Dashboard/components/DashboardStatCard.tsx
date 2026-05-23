import type { ReactNode } from "react";
import { Paper, Skeleton, Typography } from "@mui/material";

type Props = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  loading?: boolean;
  sublabel?: string;
};

const DashboardStatCard = ({
  label,
  value,
  icon,
  loading,
  sublabel,
}: Props) => {
  return (
    <Paper
      elevation={0}
      className="rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Typography
            variant="body2"
            className="font-medium text-slate-500"
            component="p"
          >
            {label}
          </Typography>
          {loading ? (
            <Skeleton variant="text" width={96} height={40} className="mt-1" />
          ) : (
            <Typography
              variant="h5"
              className="mt-1 font-semibold tracking-tight text-slate-900"
              component="p"
            >
              {value}
            </Typography>
          )}
          {sublabel && !loading && (
            <Typography variant="caption" className="mt-0.5 text-slate-400">
              {sublabel}
            </Typography>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f0f7fa] text-[var(--primary-main)]">
            {icon}
          </div>
        )}
      </div>
    </Paper>
  );
};

export default DashboardStatCard;
