import { Paper, Skeleton, Typography } from "@mui/material";

type ReviewRow = {
  id: string;
  reviewerName: string;
  businessName: string;
  rating: number | null;
  comment: string;
  createdAt: string;
};

type Props = {
  rows: ReviewRow[];
  loading?: boolean;
};

const formatDate = (value: string) => {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString();
};

const formatRating = (rating: number | null) => {
  if (rating === null || !Number.isFinite(rating)) return "";
  return `${rating.toFixed(1)} / 5`;
};

const DashboardRecentReviews = ({ rows, loading }: Props) => {
  return (
    <Paper
      elevation={0}
      className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 shadow-sm"
    >
      <div className="border-b border-slate-100 px-4 py-3">
        <Typography variant="subtitle1" className="font-semibold text-slate-900">
          Recent reviews
        </Typography>
        <Typography variant="caption" className="text-slate-500">
          Latest feedback from your customers
        </Typography>
      </div>

      <div className="divide-y divide-slate-100">
        {loading
          ? Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="px-4 py-3">
                <Skeleton variant="text" width="45%" />
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="75%" />
              </div>
            ))
          : rows.length === 0
            ? (
              <div className="px-4 py-8 text-center">
                <Typography variant="body2" className="text-slate-500">
                  No recent reviews found.
                </Typography>
              </div>
            )
            : rows.slice(0, 5).map((row) => {
                const ratingLabel = formatRating(row.rating);
                const hasMeta =
                  Boolean(row.reviewerName) ||
                  Boolean(row.businessName) ||
                  Boolean(ratingLabel);

                return (
                  <div key={row.id} className="px-4 py-3.5">
                    {hasMeta && (
                      <div className="mb-2 flex items-start justify-between gap-3">
                        <div className="min-w-0 space-y-0.5">
                          {row.reviewerName && (
                            <Typography
                              variant="body2"
                              className="truncate font-semibold text-slate-900"
                            >
                              {row.reviewerName}
                            </Typography>
                          )}
                          {row.businessName && (
                            <Typography variant="caption" className="truncate text-slate-500">
                              {row.businessName}
                            </Typography>
                          )}
                        </div>
                        {ratingLabel && (
                          <Typography
                            variant="caption"
                            className="shrink-0 rounded-md bg-amber-50 px-2 py-0.5 font-medium text-amber-800 ring-1 ring-amber-100"
                          >
                            {ratingLabel}
                          </Typography>
                        )}
                      </div>
                    )}
                    {row.comment && (
                      <p className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2 text-sm leading-relaxed text-slate-700">
                        {row.comment}
                      </p>
                    )}
                    {formatDate(row.createdAt) && (
                      <Typography variant="caption" className="mt-2 block text-slate-400">
                        {formatDate(row.createdAt)}
                      </Typography>
                    )}
                  </div>
                );
              })}
      </div>
    </Paper>
  );
};

export default DashboardRecentReviews;
