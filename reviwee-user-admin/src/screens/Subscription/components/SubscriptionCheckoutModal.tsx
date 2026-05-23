import { Dialog } from "@mui/material";
import type { BillingDetailsFormValues } from "src/models/Profile.model";
import type { SubscriptionPlanListItem } from "src/models/SubscriptionPlan.model";

type CheckoutActionType = "BUY" | "RENEW" | "UPDATE";

type Props = {
  open: boolean;
  actionType: CheckoutActionType;
  selectedPlan: SubscriptionPlanListItem | null;
  billingDetails: BillingDetailsFormValues;
  existingCredits: number;
  adjustedAmount?: number;
  onClose: () => void;
  onConfirm: () => void;
  onEditBilling: () => void;
  loading?: boolean;
};

const GST_PERCENTAGE = 18;

const toNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatRs = (value: number) =>
  `₹${value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const actionLabel: Record<CheckoutActionType, string> = {
  BUY: "Activate Plan",
  RENEW: "Renew Plan",
  UPDATE: "Update Plan",
};

const rowValue = (value: string) => value.trim() || "—";

const SubscriptionCheckoutModal = ({
  open,
  actionType,
  selectedPlan,
  billingDetails,
  existingCredits,
  adjustedAmount,
  onClose,
  onConfirm,
  onEditBilling,
  loading = false,
}: Props) => {
  if (!selectedPlan) return null;

  const planPrice = toNum(selectedPlan.planPrice);
  const baseAmount =
    actionType === "UPDATE" ? Math.max(0, toNum(adjustedAmount)) : planPrice;
  const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;
  const totalAmount = baseAmount + gstAmount;

  const newPlanCredits = Math.max(0, toNum(selectedPlan.credits));
  const totalCreditsAfter = existingCredits + newPlanCredits;

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="lg" fullWidth>
      <div className="grid grid-cols-1 md:grid-cols-2">
        <section className="border-b border-slate-200 bg-slate-50 p-5 md:border-b-0 md:border-r">
          <h2 className="text-lg font-semibold text-slate-900">Plan summary</h2>
          <p className="mt-1 text-sm text-slate-600">{selectedPlan.planName || "Selected plan"}</p>

          <div className="mt-5 space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Plan price</span>
              <span className="font-medium text-slate-900">{formatRs(planPrice)}</span>
            </div>
            {actionType === "UPDATE" && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Payable amount</span>
                <span className="font-medium text-slate-900">{formatRs(baseAmount)}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-500">GST ({GST_PERCENTAGE}%)</span>
              <span className="font-medium text-slate-900">{formatRs(gstAmount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <span className="font-semibold text-slate-800">Total</span>
              <span className="text-base font-bold text-slate-900">{formatRs(totalAmount)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 text-sm">
            <h3 className="font-semibold text-slate-900">Credits</h3>
            <div className="mt-2 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current credits</span>
                <span className="font-medium text-slate-800">{existingCredits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">New plan credits</span>
                <span className="font-medium text-emerald-700">+{newPlanCredits}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-1.5">
                <span className="font-medium text-slate-800">Total after purchase</span>
                <span className="font-semibold text-slate-900">{totalCreditsAfter}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">Billing details</h2>
            <button
              type="button"
              onClick={onEditBilling}
              className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Edit
            </button>
          </div>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-white p-4 text-xs">
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Billing name</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(billingDetails.gst_billing_name)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">GST number</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(billingDetails.gst_number)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Email</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(billingDetails.email)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Mobile</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(billingDetails.mobile)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">State</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(billingDetails.state)}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span className="text-slate-500">Address</span>
              <span className="max-w-[65%] text-right font-medium text-slate-700">
                {rowValue(
                  billingDetails.address_line1 ||
                    [billingDetails.city, billingDetails.pincode].filter(Boolean).join(", "),
                )}
              </span>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="rounded-md bg-[var(--primary-main)] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Processing..." : actionLabel[actionType]}
            </button>
          </div>
        </section>
      </div>
    </Dialog>
  );
};

export default SubscriptionCheckoutModal;
