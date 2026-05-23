import { useEffect, useMemo } from "react";
import { FormikProvider, useFormik } from "formik";
import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import useStateList from "src/hooks/useState";
import type { BillingDetailsFormValues } from "src/models/Profile.model";
import type { SubscriptionPlanListItem } from "src/models/SubscriptionPlan.model";

type CheckoutActionType = "BUY" | "RENEW" | "UPDATE";

type Props = {
  actionType: CheckoutActionType;
  selectedPlan: SubscriptionPlanListItem;
  billingValues: BillingDetailsFormValues;
  onBillingChange: (key: keyof BillingDetailsFormValues, value: string) => void;
  existingCredits: number;
  adjustedAmount?: number;
  onBack: () => void;
  onConfirm: () => void;
  loading?: boolean;
};

const GST_PERCENTAGE = 18;

const toNum = (value: unknown): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
};

const formatRs = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const actionLabel: Record<CheckoutActionType, string> = {
  BUY: "Complete Payment",
  RENEW: "Complete Payment",
  UPDATE: "Complete Payment",
};

const SubscriptionCheckoutPage = ({
  actionType,
  selectedPlan,
  billingValues,
  onBillingChange,
  existingCredits,
  onBack,
  onConfirm,
  loading = false,
}: Props) => {
  const { state: stateList, isDataLoading } = useStateList();
  const formik = useFormik<BillingDetailsFormValues>({
    initialValues: billingValues,
    enableReinitialize: true,
    onSubmit: () => {},
  });

  useEffect(() => {
    formik.setValues(billingValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billingValues]);

  const stateOptions = useMemo(
    () =>
      stateList
        .map((item) => {
          const stateName = String(item?.key ?? item?.state ?? "").trim();
          return stateName ? { label: stateName, value: stateName } : null;
        })
        .filter(Boolean) as { label: string; value: string }[],
    [stateList],
  );

  const planPrice = toNum(selectedPlan.planPrice);
  const baseAmount = planPrice;
  const gstAmount = (baseAmount * GST_PERCENTAGE) / 100;
  const totalAmount = baseAmount + gstAmount;
  const newPlanCredits = Math.max(0, toNum(selectedPlan.credits));
  const totalCreditsAfter = existingCredits + newPlanCredits;
  const durationDays = toNum(selectedPlan.durationInDays);
  const durationLabel =
    durationDays >= 365
      ? "year"
      : durationDays > 0
        ? `${durationDays} days`
        : "cycle";

  return (
    <section className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-slate-200/90 bg-white shadow-[0_18px_50px_-24px_rgba(15,23,42,0.35)]">
      <div className="grid min-h-[calc(100vh-190px)] grid-cols-1 md:grid-cols-2">
        <div className="border-b border-slate-200 bg-slate-50/90 p-7 md:border-b-0 md:border-r md:p-10">
          <div className="mb-7 border-b border-slate-200 pb-6">
            <div className="mb-4 flex items-center gap-3">
              <img
                src="/reviwee-logo-icon.svg"
                alt="Reviwee logo"
                className="h-9 w-9 rounded-lg object-contain ring-1 ring-slate-200"
              />
              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                Reviwee
              </h1>
            </div>
            <p className="max-w-[420px] text-[34px] font-bold leading-tight tracking-tight text-slate-900">
              Subscribe to {selectedPlan.planName}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-5xl font-black tracking-tight text-slate-900">
                {formatRs(totalAmount)}
              </span>
              <span className="text-base font-semibold text-slate-500">
                per {durationLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="mb-7 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            ← Back to plans
          </button>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Plan summary
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {selectedPlan.planName}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Subscription details and payable breakdown
          </p>

          <div className="mt-7 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">Plan price</span>
              <span className="font-medium text-slate-900">{formatRs(planPrice)}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500">GST ({GST_PERCENTAGE}%)</span>
              <span className="font-medium text-slate-900">{formatRs(gstAmount)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="font-semibold text-slate-900">Total due today</span>
              <span className="text-2xl font-bold text-slate-900">{formatRs(totalAmount)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5 text-sm shadow-sm">
            <h3 className="font-semibold text-slate-900">Credits summary</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Current credits</span>
                <span className="font-medium text-slate-800">{existingCredits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">New plan credits</span>
                <span className="font-medium text-emerald-700">+{newPlanCredits}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="font-medium text-slate-800">Total after purchase</span>
                <span className="font-semibold text-slate-900">{totalCreditsAfter}</span>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs text-slate-500">
            By confirming, subscription billing and GST details are processed together.
          </p>
        </div>

        <div className="flex flex-col bg-white p-7 md:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Pay with billing details</h2>
          <p className="mt-1 text-sm text-slate-500">Complete required details to continue</p>

          <FormikProvider value={formik}>
            <div className="mt-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4 md:grid-cols-2">
              <div>
                <ATMTextField
                  name="gst_billing_name"
                  label="Billing name *"
                  value={formik.values.gst_billing_name}
                  onChange={(e) => {
                    formik.setFieldValue("gst_billing_name", e.target.value);
                    onBillingChange("gst_billing_name", e.target.value);
                  }}
                  placeholder="Enter billing name"
                />
              </div>
              <div>
                <ATMTextField
                  name="gst_number"
                  label="GST number (optional)"
                  value={formik.values.gst_number}
                  onChange={(e) => {
                    formik.setFieldValue("gst_number", e.target.value);
                    onBillingChange("gst_number", e.target.value);
                  }}
                  placeholder="Enter GST number"
                />
              </div>
              <div className="md:col-span-2">
                <ATMTextField
                  name="email"
                  label="Email *"
                  value={formik.values.email}
                  onChange={(e) => {
                    formik.setFieldValue("email", e.target.value);
                    onBillingChange("email", e.target.value);
                  }}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <ATMTextField
                  name="mobile"
                  label="Mobile *"
                  value={formik.values.mobile}
                  onChange={(e) => {
                    formik.setFieldValue("mobile", e.target.value);
                    onBillingChange("mobile", e.target.value);
                  }}
                  placeholder="Enter mobile number"
                />
              </div>
              <div>
                <ATMSelect
                  name="state"
                  label="State *"
                  placeholder={isDataLoading ? "Loading states..." : "Select state"}
                  options={stateOptions}
                  value={stateOptions.find((s) => s.value === formik.values.state) ?? null}
                  onChange={(option) => {
                    const value = option?.value ?? "";
                    formik.setFieldValue("state", value);
                    onBillingChange("state", value);
                  }}
                  isLoading={isDataLoading}
                  disabled={isDataLoading}
                />
              </div>
              <div>
                <ATMTextField
                  name="pincode"
                  label="Pincode *"
                  value={formik.values.pincode}
                  onChange={(e) => {
                    formik.setFieldValue("pincode", e.target.value);
                    onBillingChange("pincode", e.target.value);
                  }}
                  placeholder="Enter pincode"
                />
              </div>
              <div>
                <ATMTextField
                  name="city"
                  label="City *"
                  value={formik.values.city}
                  onChange={(e) => {
                    formik.setFieldValue("city", e.target.value);
                    onBillingChange("city", e.target.value);
                  }}
                  placeholder="Enter city"
                />
              </div>
              <div className="md:col-span-2">
                <ATMTextField
                  name="address_line1"
                  label="Address *"
                  value={formik.values.address_line1}
                  onChange={(e) => {
                    formik.setFieldValue("address_line1", e.target.value);
                    onBillingChange("address_line1", e.target.value);
                  }}
                  placeholder="Enter address"
                />
              </div>
            </div>
          </FormikProvider>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-200 pt-5">
            <button
              type="button"
              onClick={onBack}
              disabled={loading}
              className="rounded-md px-3 py-2 text-sm text-slate-600 hover:text-slate-900 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex min-w-[220px] items-center justify-center rounded-lg bg-(--primary-main) px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-slate-900/20 hover:opacity-95 disabled:opacity-60"
            >
              {loading ? "Processing..." : actionLabel[actionType]}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubscriptionCheckoutPage;
