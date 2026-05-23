import { Link, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import PoweredBy from "../../components/atoms/PoweredBy/PoweredBy";

export type NoCreditsLocationState = {
  businessName?: string;
};

/**
 * Shown when the business has no review-generation credits or an expired plan.
 * Route: `/no-credits` (must be registered before `/:businessId` in the router).
 */
const InsufficientCreditsPage = () => {
  const { state } = useLocation();
  const businessName =
    typeof state === "object" && state !== null && "businessName" in state
      ? String((state as NoCreditsLocationState).businessName ?? "").trim()
      : "";
  const displayName = businessName || "Your business";

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-linear-to-br from-slate-50 via-white to-secondary/5" />
        <div className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-20 right-1/4 h-96 w-96 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-3 py-4 sm:px-4 sm:py-8">
        <div className="flex min-h-0 flex-1 flex-col justify-center">
          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 shadow-xl shadow-slate-200/40 backdrop-blur-sm sm:rounded-3xl">
            {/* Header — same pattern as ReviewGeneratorView */}
            <div className="relative overflow-hidden border-b border-slate-100 px-5 py-6 sm:px-8 sm:py-8">
              <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-secondary/10" />
              <div className="relative">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {displayName}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Review generation is unavailable — no credits left on this plan.
                </p>
              </div>
            </div>

            <div className="relative px-5 py-8 text-center sm:px-8 sm:py-10">
              <div className="absolute right-0 top-0 h-28 w-28 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10" />
              <div className="absolute bottom-0 left-0 h-20 w-20 -translate-x-6 translate-y-6 rounded-full bg-secondary/10" />

              <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700 shadow-inner ring-1 ring-amber-200/80">
                <svg
                  className="h-10 w-10"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 4v4"
                  />
                </svg>
              </div>

              <h2 className="mt-8 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                No credits left
              </h2>
              <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-slate-600">
                This page cannot generate reviews right now because there are no credits available.
                Your plan may have expired, or credits may need to be renewed from your dashboard.
              </p>
              <p className="mx-auto mt-3 max-w-md text-sm text-slate-500">
                If you manage this business, sign in to your account to upgrade or add credits. If
                you were invited as a customer, please contact the business directly.
              </p>

              <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button
                  component={Link}
                  to="/"
                  variant="contained"
                  sx={{
                    borderRadius: "12px",
                    px: 3,
                    py: 1.25,
                    fontWeight: 600,
                    textTransform: "none",
                    bgcolor: "var(--color-primary)",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.08)",
                    "&:hover": {
                      bgcolor: "var(--color-primary)",
                      filter: "brightness(1.08)",
                    },
                  }}
                >
                  Back to home
                </Button>
              </div>
            </div>
          </div>
        </div>

        <PoweredBy />
      </div>
    </div>
  );
};

export default InsufficientCreditsPage;
