import { Link as RouterLink } from "react-router-dom";
import { Button, Paper, Skeleton, Typography, Chip } from "@mui/material";

type Props = {
  activePlanData: Record<string, unknown> | null | undefined;
  loading?: boolean;
  profileCredits?: {
    total: number;
    remaining: number;
  } | null;
};

const DashboardSubscriptionCard = ({
  activePlanData,
  loading,
  profileCredits,
}: Props) => {
  const planName =
    (activePlanData?.planName as string | undefined) ||
    (activePlanData?.subscriptionPlanName as string | undefined) ||
    "—";
  const planStatus = activePlanData?.planStatus as string | undefined;
  const planExpiryDate = activePlanData?.planExpiryDate as string | undefined;
  const totalCredits = profileCredits?.total ?? null;
  const remainingCredits = profileCredits?.remaining ?? null;
  const showCredits =
    totalCredits !== null &&
    totalCredits >= 0 &&
    remainingCredits !== null &&
    remainingCredits >= 0;

  return (
    <Paper
      elevation={0}
      className="flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-sm"
    >
      <Typography variant="subtitle1" className="font-semibold text-slate-900">
        Your credits plan
      </Typography>
      <Typography variant="caption" className="text-slate-500">
        Current credit package details
      </Typography>

      {loading ? (
        <div className="mt-4 space-y-2">
          <Skeleton variant="rounded" height={56} />
          <Skeleton variant="text" width="60%" />
        </div>
      ) : !activePlanData ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
          <Typography variant="body2" className="text-slate-600">
            No active credit plan on file. Browse plans to get started.
          </Typography>
          <Button
            component={RouterLink}
            to="/subscription"
            variant="contained"
            size="small"
            className="mt-3 !rounded-lg !normal-case !shadow-none"
            sx={{ bgcolor: "var(--primary-main)", "&:hover": { bgcolor: "var(--primary-hover)" } }}
          >
            View credit plans
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <div className="rounded-xl bg-gradient-to-br from-[#f0f7fa] to-white p-3 ring-1 ring-slate-100">
            <Typography variant="body2" className="font-semibold text-slate-900">
              {planName}
            </Typography>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {planStatus && (
                <Chip
                  size="small"
                  label={planStatus}
                  color={planStatus === "EXPIRED" ? "error" : "primary"}
                  variant="outlined"
                  className="!text-xs"
                />
              )}
             
            </div>
            {planExpiryDate && (
              <Typography variant="caption" className="mt-1 block text-slate-500">
                Expires {planExpiryDate}
              </Typography>
            )}
            {showCredits && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
                <Typography variant="caption" className="text-slate-500">
                  Credits remaining
                </Typography>
                <Typography variant="body2" className="font-semibold text-slate-900">
                  {remainingCredits} / {totalCredits}
                </Typography>
              </div>
            )}
          </div>
          <Button
            component={RouterLink}
            to="/subscription"
            variant="outlined"
            size="small"
            className="!rounded-lg !normal-case !border-slate-300 !text-slate-700"
          >
            Manage Credits
          </Button>
        </div>
      )}
    </Paper>
  );
};

export default DashboardSubscriptionCard;
