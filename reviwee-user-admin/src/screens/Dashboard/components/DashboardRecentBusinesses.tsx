import { Link as RouterLink } from "react-router-dom";
import {
  Button,
  Chip,
  IconButton,
  Paper,
  Skeleton,
  Tooltip,
  Typography,
} from "@mui/material";
import { MdEdit } from "react-icons/md";
import type { BusinessProfileListItem } from "../../../models/BusinessProfile.model";
import usecreditScore from "../../../hooks/useCreditScoreOptions";

type Props = {
  rows: BusinessProfileListItem[];
  loading?: boolean;
};

const getReviewRuleLabel = (
  creditConfigId: unknown,
  creditConfigs: Array<Record<string, unknown>>,
  isCreditLoading: boolean,
) => {
  const id = String(creditConfigId ?? "");
  if (!id) return "Review length: -";
  if (isCreditLoading) return "Review length: Loading...";

  const match = creditConfigs.find((config) => String(config._id ?? "") === id);
  if (!match) return "Review length: -";

  const min = match.minWords;
  const max = match.maxWords;
  const minLabel = typeof min === "number" && Number.isFinite(min) ? String(min) : "-";
  const maxLabel = typeof max === "number" && Number.isFinite(max) ? String(max) : "-";

  return `Review length: ${minLabel}-${maxLabel} words`;
};

const getCreditUsageLabel = (
  creditConfigId: unknown,
  creditConfigs: Array<Record<string, unknown>>,
  isCreditLoading: boolean,
) => {
  const id = String(creditConfigId ?? "");
  if (!id) return "Credit cost: -";
  if (isCreditLoading) return "Credit cost: Loading...";

  const match = creditConfigs.find((config) => String(config._id ?? "") === id);
  if (!match) return "Credit cost: -";

  const credit = match.credit;
  if (typeof credit === "number" && Number.isFinite(credit)) {
    return `Credit cost: ${credit} ${credit === 1 ? "credit" : "credits"}`;
  }

  if (typeof credit === "string" && credit.trim() !== "") {
    const parsed = Number(credit);
    if (Number.isFinite(parsed)) {
      return `Credit cost: ${parsed} ${parsed === 1 ? "credit" : "credits"}`;
    }
  }

  return "Credit cost: -";
};

const DashboardRecentBusinesses = ({ rows, loading }: Props) => {
  const { credit: creditConfigs, isDataLoading: isCreditLoading } = usecreditScore();
  const creditConfigList = Array.isArray(creditConfigs)
    ? (creditConfigs as Array<Record<string, unknown>>)
    : [];

  return (
    <Paper
      elevation={0}
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm"
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <Typography variant="subtitle1" className="font-semibold text-slate-900">
          Recent business profiles
        </Typography>
        <Typography variant="caption" className="text-slate-500">
          Review word limit and per-review credit cost
        </Typography>
      </div>
      <div className="space-y-2 p-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <Skeleton variant="text" width="40%" />
              <Skeleton variant="text" width="70%" />
              <Skeleton variant="rounded" height={28} className="mt-2" />
            </div>
          ))
        ) : rows.length === 0 ? (
          <Typography variant="body2" className="py-6 text-center text-slate-500">
            No business profiles yet.
          </Typography>
        ) : (
          rows.map((row) => {
            const id = row.id ?? row._id ?? "";
            const active = row.isActive !== false;
            const rowRecord = row as Record<string, unknown>;
            const reviewRuleLabel = getReviewRuleLabel(
              rowRecord.creditConfigId,
              creditConfigList,
              isCreditLoading,
            );
            const creditUsageLabel = getCreditUsageLabel(
              rowRecord.creditConfigId,
              creditConfigList,
              isCreditLoading,
            );
            return (
              <div
                key={id || row.businessDisplayName}
                className="rounded-xl border border-slate-200 bg-slate-50/50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Typography variant="body2" className="truncate font-semibold text-slate-900">
                      {row.businessDisplayName}
                    </Typography>
                    <Typography variant="caption" className="mt-0.5 block text-slate-500">
                      {reviewRuleLabel}
                    </Typography>
                    <Typography variant="caption" className="mt-0.5 block text-slate-500">
                      {creditUsageLabel}
                    </Typography>
                  </div>
                  <div className="flex items-center gap-1">
                    {id && (
                      <Tooltip title="Edit profile">
                        <IconButton
                          component={RouterLink}
                          to={`/business-profile/edit/${id}`}
                          size="small"
                          className="!text-slate-500 hover:!text-[var(--primary-main)]"
                        >
                          <MdEdit className="text-base" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Chip
                      size="small"
                      label={active ? "Active" : "Inactive"}
                      color={active ? "success" : "default"}
                      variant={active ? "filled" : "outlined"}
                      className="!text-xs"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  {id ? (
                    <Button
                      component={RouterLink}
                      to={`/business-profile/view/${id}`}
                      size="small"
                      variant="outlined"
                      className="!rounded-lg !normal-case !border-slate-300 !text-slate-700"
                    >
                      View profile
                    </Button>
                  ) : (
                    <span className="text-xs text-slate-400">Profile ID missing</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Paper>
  );
};

export default DashboardRecentBusinesses;
