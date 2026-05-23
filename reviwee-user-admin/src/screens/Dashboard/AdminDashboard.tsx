import { useMemo, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Button, Typography } from "@mui/material";
import { FaBuilding } from "react-icons/fa";
import { MdRefresh } from "react-icons/md";
import type { BusinessProfileListItem } from "../../models/BusinessProfile.model";
import type { BusinessProfileListPayload } from "../../models/BusinessProfile.model";
import { useGetAllBusinessProfileDataQuery } from "../../services/BusinessProfileService";
import { useGetRecentReviewsQuery } from "../../services/ReviewService";
import { useGetActivePackageQuery } from "../../services/SubscriptionPlanService";
import { useGetProfileQuery } from "../../services/UserService";
import DashboardRecentBusinesses from "./components/DashboardRecentBusinesses";
import DashboardRecentReviews from "./components/DashboardRecentReviews";

const emptyFilter = [{ fieldName: "", value: [] as string[] }];

const baseBusinessPayload = (): Omit<BusinessProfileListPayload, "limit" | "page" | "filterBy"> => ({
  params: ["businessDisplayName"],
  searchValue: "",
  dateFilter: {
    startDate: "",
    endDate: "",
    dateFilterKey: "",
  },
  rangeFilterBy: {
    rangeFilterKey: "",
    rangeInitial: "",
    rangeEnd: "",
  },
  orderBy: "createdAt",
  orderByValue: -1,
  isPaginationRequired: true,
});

const normalizeBusinessRows = (raw: unknown): BusinessProfileListItem[] => {
  const source = raw as BusinessProfileListItem[] | undefined;
  if (!Array.isArray(source)) return [];
  return source.map((item) => ({
    ...item,
    id: item.id ?? item._id,
  }));
};

const toFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

/** API body is usually `{ data: subscription }` — same as SubscriptionListWrapper */
const unwrapCustomerSubscription = (raw: unknown): Record<string, unknown> | null => {
  if (!raw || typeof raw !== "object") return null;
  const top = raw as Record<string, unknown>;
  const nested = top.data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return top;
};

const pickSubscriptionRemainingCredits = (subscription: Record<string, unknown> | null): number | null => {
  if (!subscription) return null;

  const direct = toFiniteNumber(
    subscription.remainingCredits ??
      subscription.remainingCredit ??
      subscription.creditsRemaining ??
      subscription.availableCredits ??
      subscription.balanceCredits ??
      subscription.remaining ??
      null,
  );
  if (direct !== null && direct >= 0) return direct;

  const total = toFiniteNumber(subscription.totalCredits);
  const used = toFiniteNumber(
    subscription.usedCredits ?? subscription.consumedCredits ?? subscription.creditsUsed ?? null,
  );
  if (total !== null && used !== null && total >= 0 && used >= 0) {
    return Math.max(0, total - used);
  }

  const creditsOnly = toFiniteNumber(subscription.credits);
  if (creditsOnly !== null && creditsOnly >= 0) return creditsOnly;

  return null;
};

/** Hide raw Mongo/UUID-style ids accidentally mapped into name fields */
const looksLikeDatabaseId = (value: string): boolean => {
  const t = value.trim();
  if (!t) return false;
  if (/^[a-f0-9]{24}$/i.test(t)) return true;
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(t)) return true;
  return false;
};

const sanitizeDisplayText = (value: string): string => {
  const t = value.trim();
  if (!t || looksLikeDatabaseId(t)) return "";
  return t;
};

type DashboardReviewRow = {
  id: string;
  reviewerName: string;
  businessName: string;
  rating: number | null;
  comment: string;
  createdAt: string;
};

const normalizeReviewRows = (raw: unknown): DashboardReviewRow[] => {
  const sourceArray = Array.isArray(raw)
    ? (raw as Record<string, unknown>[])
    : raw && typeof raw === "object"
      ? [raw as Record<string, unknown>]
      : [];

  if (!sourceArray.length) return [];

  const mappedRows = sourceArray.map((item, idx) => {
    const id =
      String(item._id ?? item.id ?? item.reviewId ?? `review-${idx}`) || `review-${idx}`;

    const reviewerName = sanitizeDisplayText(
      String(
        item.reviewerName ??
          item.userName ??
          item.customerName ??
          item.name ??
          item.reviewByName ??
          "",
      ),
    );

    const businessName = sanitizeDisplayText(
      String(
        item.businessDisplayName ??
          item.businessName ??
          item.profileName ??
          "",
      ),
    );

    const rating = toFiniteNumber(
      item.rating ?? item.reviewRating ?? item.starRating ?? null,
    );

    const comment = String(
      item.review ??
        item.comment ??
        item.feedback ??
        item.reviewText ??
        item.reviewsText ??
        "",
    ).trim();

    const createdAt = String(item.createdAt ?? item.reviewDate ?? item.date ?? "").trim();

    return {
      id,
      reviewerName,
      businessName,
      rating,
      comment,
      createdAt,
    };
  });

  return mappedRows
    .filter(
      (row) =>
        row.reviewerName !== "" ||
        row.businessName !== "" ||
        row.comment !== "" ||
        row.createdAt !== "" ||
        row.rating !== null,
    )
    .slice(0, 5);
};

const AdminDashboard = () => {
  const recentPayload = useMemo<BusinessProfileListPayload>(
    () => ({
      ...baseBusinessPayload(),
      limit: 5,
      page: 1,
      filterBy: emptyFilter,
    }),
    [],
  );

  const {
    data: recentData,
    isLoading: recentLoading,
    isFetching: recentFetching,
    error: recentError,
    refetch: refetchRecent,
  } = useGetAllBusinessProfileDataQuery(recentPayload);

  const {
    data: recentReviewsRes,
    isLoading: reviewsLoading,
    isFetching: reviewsFetching,
    error: reviewsError,
    refetch: refetchRecentReviews,
  } = useGetRecentReviewsQuery(undefined);

  const {
    data: activePackageRes,
    isLoading: activePackageLoading,
    isFetching: activePackageFetching,
    error: activePackageError,
    refetch: refetchActivePackage,
  } = useGetActivePackageQuery("");

  const { data: profileRes } = useGetProfileQuery(undefined);

  const recentRows = useMemo(
    () => normalizeBusinessRows(recentData?.data),
    [recentData?.data],
  );
  const recentReviewRows = useMemo(() => {
    const response = recentReviewsRes as
      | { data?: unknown; reviews?: unknown; items?: unknown }
      | undefined;
    const innerData =
      response?.data && typeof response.data === "object"
        ? (response.data as { data?: unknown; reviews?: unknown; items?: unknown }).data ??
          response.data
        : response?.data;
    return normalizeReviewRows(
      innerData ?? response?.reviews ?? response?.items ?? recentReviewsRes,
    );
  }, [recentReviewsRes]);

  const subscriptionRecord = useMemo(
    () => unwrapCustomerSubscription(activePackageRes),
    [activePackageRes],
  );
  const subscriptionRemainingCredits = useMemo(
    () => pickSubscriptionRemainingCredits(subscriptionRecord),
    [subscriptionRecord],
  );

  const profileRecord = profileRes?.data as Record<string, unknown> | undefined;
  const profileName =
    (profileRecord?.name as string) ||
    (profileRecord?.firstName as string) ||
    (profileRecord?.fullName as string) ||
    (profileRecord?.userName as string);
  const storedName = localStorage.getItem("userName");
  const displayName = profileName || storedName || "there";

  const recentLoadingState = recentLoading || recentFetching;
  const reviewsLoadingState = reviewsLoading || reviewsFetching;
  const subscriptionLoadingState = activePackageLoading || activePackageFetching;

  const anyError = recentError || reviewsError || activePackageError;

  const handleRefresh = useCallback(() => {
    void refetchRecent();
    void refetchRecentReviews();
    void refetchActivePackage();
  }, [refetchRecent, refetchRecentReviews, refetchActivePackage]);

  return (
    <div className="w-full min-h-0 space-y-4 bg-slate-50/90 p-3 md:p-5 pb-6">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Typography variant="h5" className="!font-semibold !tracking-tight !text-slate-900">
              Welcome back, {displayName}
            </Typography>
            <Typography variant="body2" className="!mt-1 !text-slate-500">
              Quick overview of your business profiles and credits
            </Typography>
            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 ring-1 ring-emerald-100">
              <Typography variant="caption" className="font-semibold text-emerald-700">
                Remaining credits:{" "}
                {subscriptionLoadingState
                  ? "Loading..."
                  : subscriptionRemainingCredits !== null
                    ? `${subscriptionRemainingCredits}`
                    : "-"}
              </Typography>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              component={RouterLink}
              to="/business-profile"
              variant="outlined"
              size="small"
              startIcon={<FaBuilding className="text-base" />}
              className="!rounded-xl !normal-case !border-slate-300 !text-slate-700"
            >
              View all profiles
            </Button>
            <Button
              type="button"
              variant="contained"
              size="small"
              onClick={handleRefresh}
              startIcon={<MdRefresh className="text-lg" />}
              className="!rounded-xl !normal-case !bg-[var(--primary-main)] !shadow-none hover:!bg-[var(--primary-hover)]"
            >
              Refresh
            </Button>
          </div>
        </div>
      </section>

      {anyError && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          Some dashboard data could not be loaded. Try refresh, or check your connection.
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <DashboardRecentBusinesses rows={recentRows} loading={recentLoadingState} />
        <DashboardRecentReviews
          rows={recentReviewRows}
          loading={reviewsLoadingState}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
