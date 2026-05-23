import { useMemo, useState } from "react";
import ATMPageHeader from "src/components/UI/atoms/ATMPageHeader/ATMPageHeader";
import type { SubscriptionPlanListItem } from "src/models/SubscriptionPlan.model";
import type { BillingDetailsFormValues } from "src/models/Profile.model";
import type { InvoiceListItem } from "src/models/Invoice.model";
import { FaCheck, FaLock, FaRegStar } from "react-icons/fa";
import SubscriptionTabs from "./components/SubscriptionTabs";
import BillingInvoicesSection from "./components/BillingInvoicesSection";

type PaginationProps = {
  totalItems: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  setPage: (v: number) => void;
  setRowsPerPage: (v: number) => void;
  setSearchValue: (v: string) => void;
};

type Props = {
  items: SubscriptionPlanListItem[];
  activePlanData?: Record<string, unknown>;
  isLoading: boolean;
  paginationProps: PaginationProps;
  loadingPlanId: string | null;
  loadingType: "BUY" | "UPGRADE" | "RENEW" | "UPDATE" | null;
  onBuyNow: (plan: SubscriptionPlanListItem) => void;
  onRenew: (plan: SubscriptionPlanListItem) => void;
  onUpgradeClick: (plan: SubscriptionPlanListItem) => void;
  billingDetails: BillingDetailsFormValues;
  onEditBilling: () => void;
  invoiceItems: InvoiceListItem[];
  invoicesLoading?: boolean;
  invoiceErrorMessage?: string;
  invoiceStatusHint?: string;
  onRefreshInvoices: () => void;
  onDownloadInvoice: (invoice: InvoiceListItem) => void;
  /** Full-page onboarding purchase step (no side-nav — wrapper handles chrome). */
  uiVariant?: "app" | "onboarding";
};

const formatPlanName = (name: string) =>
  name
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

const isPlanExpired = (
  planStatus: unknown,
  planExpiryDate: unknown,
  now: Date,
) => {
  if (
    typeof planStatus === "string" &&
    planStatus.trim().toUpperCase() === "EXPIRED"
  ) {
    return true;
  }

  if (typeof planExpiryDate !== "string" || !planExpiryDate.trim()) {
    return false;
  }

  const expiry = new Date(planExpiryDate);
  if (Number.isNaN(expiry.getTime())) {
    return false;
  }

  // Date-only values are treated as valid till end of that day.
  if (!planExpiryDate.includes("T")) {
    expiry.setHours(23, 59, 59, 999);
  }

  return expiry.getTime() < now.getTime();
};

const SubscriptionList = ({
  items,
  activePlanData,
  isLoading,
  paginationProps: {
    searchValue,
    setSearchValue,
  },
  loadingPlanId,
  loadingType,
  onBuyNow,
  onRenew,
  onUpgradeClick,
  billingDetails,
  onEditBilling,
  invoiceItems,
  invoicesLoading = false,
  invoiceErrorMessage = "",
  invoiceStatusHint = "",
  onRefreshInvoices,
  onDownloadInvoice,
  uiVariant = "app",
}: Props) => {
  const isOnboarding = uiVariant === "onboarding";
  const [activeTab, setActiveTab] = useState<"plans" | "billing">("plans");

  const recommendedPlanId = useMemo(() => {
    if (!isOnboarding || items.length === 0) return "";
    const enriched = items
      .map((p) => ({ plan: p, id: p._id || p.id || "" }))
      .filter((x) => x.id);
    if (enriched.length === 0) return "";
    const paid = enriched.filter((x) => Number(x.plan.planPrice) > 0);
    const pick =
      paid.length > 0
        ? [...paid].sort(
            (a, b) => Number(a.plan.planPrice) - Number(b.plan.planPrice),
          )[0]
        : enriched[0];
    return pick.id;
  }, [isOnboarding, items]);

  const onboardingBuyLabel = (plan: SubscriptionPlanListItem) =>
    Number(plan.planPrice) === 0 ? "Start free" : "Choose this plan";

  const now = new Date();
  const currentPlanId =
    (activePlanData?._id as string | undefined) ||
    (activePlanData?.subscriptionPlanId as string | undefined);
  const currentPlanPrice = Number(activePlanData?.planPrice || 0);
  const isExpired = isPlanExpired(
    activePlanData?.planStatus,
    activePlanData?.planExpiryDate,
    now,
  );

  const getButtonForPlan = (plan: SubscriptionPlanListItem) => {
    const planPrice = Number(plan.planPrice);
    const planId = plan._id || plan.id || "";
    const isCurrent =
      planId === currentPlanId || planId === activePlanData?.subscriptionPlanId;
    if (isCurrent && !isExpired) {
      return (
        <span className="inline-flex items-center justify-center w-full px-3 py-2 mt-2 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
          ✓ Active Plan
        </span>
      );
    }

    if (!activePlanData) {
      return (
        <button
          type="button"
          disabled={loadingPlanId === planId}
          className={
            isOnboarding
              ? "w-full px-4 py-3 mt-2 text-sm font-semibold rounded-xl disabled:opacity-60 transition-all shadow-md shadow-slate-900/10 hover:shadow-lg hover:brightness-[1.03] active:scale-[0.99]"
              : "w-full px-3 py-2 mt-2 text-xs font-semibold rounded-md disabled:opacity-60 transition-colors shadow-sm hover:opacity-90"
          }
          style={{ backgroundColor: "var(--primary-main)", color: "#ffffff" }}
          onClick={(e) => {
            e.stopPropagation();
            onBuyNow(plan);
          }}
        >
          {loadingPlanId === planId
            ? "Processing..."
            : isOnboarding
              ? onboardingBuyLabel(plan)
              : "Buy Now"}
        </button>
      );
    }

    if (isExpired && isCurrent) {
      return (
        <button
          type="button"
          disabled={loadingPlanId === planId}
          className="w-full px-3 py-2 mt-2 text-xs font-semibold rounded-md disabled:opacity-60 transition-colors shadow-sm hover:opacity-90"
          style={{ backgroundColor: "var(--primary-main)", color: "#ffffff" }}
          onClick={(e) => {
            e.stopPropagation();
            onRenew(plan);
          }}
        >
          {loadingPlanId === planId ? "Processing..." : "Renew Plan"}
        </button>
      );
    }

    if (planPrice > currentPlanPrice) {
      return (
        <button
          type="button"
          disabled={loadingType === "UPDATE"}
          className="w-full px-3 py-2 mt-2 text-xs font-semibold rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-60 transition-colors shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onUpgradeClick(plan);
          }}
        >
          {loadingType === "UPDATE" ? "Processing..." : "Upgrade Plan"}
        </button>
      );
    }

    return (
      <span className="inline-flex items-center justify-center w-full px-3 py-2 mt-2 text-xs font-medium rounded-md bg-slate-100 text-slate-500 border border-slate-200">
        Not Available
      </span>
    );
  };

  const getPlanFeatures = (plan: SubscriptionPlanListItem) => {
    const features: string[] = [];
    if (plan.credits != null) {
      features.push(`${plan.credits} credits`);
    }
    if (plan.durationInDays != null) {
      features.push(`${plan.durationInDays} days validity`);
    }
    if (plan.totalTiffinsAllowed != null) {
      features.push(`${plan.totalTiffinsAllowed} tiffins allowed`);
    }
    if (plan.noOfCustomers != null) {
      features.push(`${plan.noOfCustomers} customers`);
    }
    if (features.length === 0) {
      features.push("All basic features included");
    }
    return features;
  };

  const handleCardClick = (plan: SubscriptionPlanListItem) => {
    const planPrice = Number(plan.planPrice);
    const planId = plan._id || plan.id || "";
    const isCurrent =
      planId === currentPlanId || planId === activePlanData?.subscriptionPlanId;

    if (!activePlanData) {
      onBuyNow(plan);
      return;
    }

    if (isExpired && isCurrent) {
      onRenew(plan);
      return;
    }

    if (planPrice > currentPlanPrice) {
      onUpgradeClick(plan);
      return;
    }
  };

  const plansGrid = isLoading ? (
    <div className="flex items-center justify-center py-24">
      <div className="h-11 w-11 animate-spin rounded-full border-2 border-[var(--primary-main)] border-t-transparent" />
    </div>
  ) : items.length === 0 ? (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/90 py-20 text-center text-slate-500">
      No subscription plans available.
    </div>
  ) : (
    <section
      className={
        isOnboarding
          ? "mx-auto grid max-w-5xl gap-5 sm:grid-cols-2 overflow-y-auto pb-8"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 overflow-y-auto pb-4"
      }
    >
      {items.map((plan) => {
        const planId = plan._id || plan.id || "";
        const isCurrent =
          planId === currentPlanId ||
          planId === activePlanData?.subscriptionPlanId;
        const planExpired = isCurrent && isExpired;
        const features = getPlanFeatures(plan);
        const displayName = plan.planName
          ? formatPlanName(plan.planName)
          : "Plan";
        const isRecommended =
          isOnboarding &&
          !activePlanData &&
          planId === recommendedPlanId &&
          planId !== "";

        const cardClass = isOnboarding
          ? `flex min-h-[320px] flex-col rounded-2xl border bg-white p-6 sm:min-h-0 sm:p-7 text-left shadow-[0_12px_40px_-12px_rgba(15,23,42,0.16)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-18px_rgba(15,23,42,0.22)] ${
              isRecommended
                ? "border-[var(--primary-main)]/45 ring-2 ring-[var(--primary-main)]/25"
                : "border-slate-200/90 hover:border-slate-300"
            } ${isCurrent && !planExpired ? "border-emerald-400/80 ring-1 ring-emerald-500/20" : ""} `
          : `flex flex-col rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer w-full ${
              isCurrent && !planExpired
                ? "border-teal-500 ring-1 ring-teal-500/20"
                : "border-slate-200 hover:border-slate-300"
            }`;

        const featureRowClass = isOnboarding
          ? "flex items-start gap-2.5 text-sm text-slate-600"
          : "flex items-start gap-1.5 text-xs text-slate-600";

        const bullet = isOnboarding ? (
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <FaCheck className="h-3 w-3" aria-hidden />
          </span>
        ) : (
          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-teal-500" />
        );

        return (
          <article
            key={planId}
            role="button"
            tabIndex={0}
            onClick={() => handleCardClick(plan)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCardClick(plan);
              }
            }}
            className={`${cardClass} cursor-pointer`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {displayName}
                </h2>
                {isOnboarding && isRecommended && (
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--primary-main)]">
                    Popular choice
                  </p>
                )}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {isCurrent && !planExpired && (
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700 ring-1 ring-emerald-200/80">
                    Active
                  </span>
                )}
                {isCurrent && planExpired && (
                  <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-semibold text-rose-700 ring-1 ring-rose-200/80">
                    Expired
                  </span>
                )}
              </div>
            </div>

            <div className={isOnboarding ? "mt-5" : "mt-2"}>
              {isOnboarding ? (
                <>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-lg font-semibold text-slate-500">
                      ₹
                    </span>
                    <span className="text-4xl font-bold tracking-tight text-slate-900">
                      {plan.planPrice}
                    </span>
                    {plan.durationInDays != null && (
                      <span className="ml-1 text-sm text-slate-500">
                        / {plan.durationInDays} days
                      </span>
                    )}
                  </div>
                  {Number(plan.planPrice) > 0 && (
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      +18% GST extra
                    </p>
                  )}
                  <p className="mt-1 text-xs text-slate-500">
                    {Number(plan.planPrice) === 0
                      ? "No charge today — activate instantly."
                      : "Secure payment via Razorpay after you continue."}
                  </p>
                </>
              ) : (
                <div>
                  <span className="text-xl font-bold text-slate-900">
                    ₹{plan.planPrice}
                  </span>
                  {plan.durationInDays != null && (
                    <span className="ml-1 text-xs font-medium text-slate-500">
                      / {plan.durationInDays} days
                    </span>
                  )}
                  {Number(plan.planPrice) > 0 && (
                    <p className="mt-1 text-[11px] font-medium text-slate-500">
                      +18% GST 
                    </p>
                  )}
                </div>
              )}
            </div>

            <div
              className={
                isOnboarding
                  ? "mt-6 flex flex-1 flex-col"
                  : "mt-2 flex flex-1 min-h-0 flex-col"
              }
            >
              <p
                className={
                  isOnboarding
                    ? "text-xs font-semibold uppercase tracking-wide text-slate-400"
                    : "sr-only"
                }
              >
                {isOnboarding ? "Included" : "Features"}
              </p>
              <ul className={isOnboarding ? "mt-3 space-y-2.5" : "space-y-1"}>
                {features.map((feature, i) => (
                  <li key={i} className={featureRowClass}>
                    {bullet}
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.description && (
                <p
                  className={
                    isOnboarding
                      ? "mt-4 line-clamp-3 text-sm leading-relaxed text-slate-500"
                      : "mt-2 line-clamp-3 text-xs text-slate-500"
                  }
                >
                  {plan.description}
                </p>
              )}
            </div>

            <div
              className={
                isOnboarding
                  ? "mt-8 shrink-0 border-t border-slate-100 pt-5"
                  : "mt-auto shrink-0 border-t border-slate-100 pt-3"
              }
            >
              {getButtonForPlan(plan)}
            </div>
          </article>
        );
      })}
    </section>
  );

  if (isOnboarding) {
    return (
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-size-[40px_40px]"
        />
        <div className="relative flex min-h-0 flex-1 flex-col px-4 py-6 sm:px-8 sm:py-8">
          <header className="mx-auto flex w-full max-w-5xl flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--primary-main)] text-white shadow-lg shadow-[var(--primary-main)]/25">
                <FaRegStar className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <p className="text-base font-bold tracking-tight text-slate-900">
                  Reviwee
                </p>
                <p className="text-xs text-slate-500">Admin onboarding</p>
              </div>
            </div>
            <div className="flex flex-col items-stretch gap-3 sm:items-end">
              <div className="inline-flex w-fit max-w-full rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-200/90">
                <span className="rounded-full bg-[var(--primary-main)] px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                  1 · Plan
                </span>
                <span className="rounded-full px-3 py-1.5 text-xs font-medium text-slate-500">
                  2 · Business profile
                </span>
              </div>
              <ATMPageHeader
                moduleName="SUBSCRIPTION"
                pageTitle=""
                searchValue={searchValue}
                onSearchChange={(v) => setSearchValue(v)}
                debounceMs={300}
                hideAddButton
                toolbarOnly
              />
            </div>
          </header>

          <section className="relative mx-auto mt-8 w-full max-w-5xl overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_20px_50px_-24px_rgba(15,23,42,0.25)]">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_90%_80%_at_100%_-10%,rgba(119,143,240,0.14),transparent_50%),radial-gradient(ellipse_70%_60%_at_0%_110%,rgba(28,26,94,0.08),transparent_45%)]"
            />
            <div className="relative px-6 py-8 sm:px-10 sm:py-10">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Step 1 of 2
              </p>
              <h1 className="mt-2 max-w-2xl text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Choose a plan to get started
              </h1>
             
              <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-600 backdrop-blur-sm">
                <FaLock className="h-3.5 w-3.5 text-emerald-600" aria-hidden />
                Secure checkout · Encrypted connection
              </p>
            </div>
          </section>

          <div className="relative mx-auto mt-8 w-full max-w-5xl flex-1 min-h-0">
            {plansGrid}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-2 py-1">
      <div className="sticky top-0 z-10 bg-white p-4 md:static">
        <ATMPageHeader
          moduleName="SUBSCRIPTION"
          pageTitle="Manage Credits"
          searchValue={searchValue}
          onSearchChange={(v) => setSearchValue(v)}
          debounceMs={300}
          hideAddButton
        />
      </div>

      <section className="mb-4 rounded-lg bg-linear-to-r from-sky-500 to-teal-500 p-4 text-white shadow-md">
        <h1 className="text-lg font-bold tracking-tight md:text-xl">
          Manage Credits
        </h1>
        <p className="mt-1 max-w-xl text-xs text-white/95">
          Choose the right credit plan for your business. Buy, renew, or
          upgrade anytime.
        </p>
      </section>

      <SubscriptionTabs activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === "plans" ? (
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{plansGrid}</div>
      ) : (
        <BillingInvoicesSection
          billingDetails={billingDetails}
          onEditBilling={onEditBilling}
          invoiceItems={invoiceItems}
          invoicesLoading={invoicesLoading}
          invoiceErrorMessage={invoiceErrorMessage}
          invoiceStatusHint={invoiceStatusHint}
          onRefreshInvoices={onRefreshInvoices}
          onDownloadInvoice={onDownloadInvoice}
        />
      )}
    </div>
  );
};

export default SubscriptionList;
