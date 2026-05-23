import React, { useMemo } from "react";
import { Dialog } from "@mui/material";
import type { SubscriptionPlanListItem } from "src/models/SubscriptionPlan.model";

/** Parse YYYY-MM-DD as local midnight to avoid UTC off-by-one */
const parseDateOnlyLocal = (iso: string): Date | null => {
  const part = iso.split("T")[0];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(part);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const dt = new Date(y, mo, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const diffDaysUtcMs = (a: Date, b: Date): number =>
  Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));

function getTotalPlanDays(
  currentPlan: Record<string, unknown>
): number {
  const startStr =
    (currentPlan.planStartDate as string) ||
    (currentPlan.planAddedOn as string) ||
    "";
  const expiryStr = (currentPlan.planExpiryDate as string) || "";

  const start = parseDateOnlyLocal(startStr);
  const expiry = parseDateOnlyLocal(expiryStr);

  if (start && expiry) {
    const span = diffDaysUtcMs(start, expiry);
    if (span > 0) return span;
  }

  return 1;
}

const toIntRupeeFloor = (value: number | string): number =>
  Math.floor(Number(value));
const toIntRupeeCeil = (value: number | string): number =>
  Math.ceil(Number(value));

const formatRsInt = (value: number | string) =>
  String(toIntRupeeFloor(value));

interface UpdatePlanModalProps {
  open: boolean;
  currentPlan: Record<string, unknown>;
  selectedPlan: SubscriptionPlanListItem | null;
  availablePlans: SubscriptionPlanListItem[];
  onClose: () => void;
  onUpdatePlan: (selectedPlan: SubscriptionPlanListItem, adjustedAmount: number) => void;
  isLoading?: boolean;
}

const UpdatePlanModal: React.FC<UpdatePlanModalProps> = ({
  open,
  currentPlan,
  selectedPlan,
  availablePlans,
  onClose,
  onUpdatePlan,
  isLoading = false,
}) => {
  const today = new Date().toISOString().split("T")[0];

  const selectedPlanDetails = useMemo(() => {
    if (!selectedPlan) return null;
    const selectedId = selectedPlan._id || selectedPlan.id;
    if (!selectedId) return selectedPlan;
    return (
      availablePlans.find((p) => (p._id || p.id) === selectedId) || selectedPlan
    );
  }, [selectedPlan, availablePlans]);

  const planMetrics = useMemo(() => {
    if (!currentPlan) return null;

    const planStartDate =
      (currentPlan.planStartDate as string) ||
      (currentPlan.planAddedOn as string) ||
      (currentPlan.createdAt as string) ||
      today;
    const planPrice = Number(currentPlan.planPrice || 0);

    const durationInDays = getTotalPlanDays(currentPlan);

    const startLocal = parseDateOnlyLocal(planStartDate.split("T")[0]) ||
      new Date(planStartDate);
    const todayLocal = parseDateOnlyLocal(today) || new Date(today);

    if (isNaN(startLocal.getTime()) || isNaN(todayLocal.getTime())) {
      return null;
    }

    const elapsedDays = Math.max(0, diffDaysUtcMs(startLocal, todayLocal));
    const daysUsed = Math.min(durationInDays, elapsedDays);
    const daysRemaining = Math.max(0, durationInDays - daysUsed);
    const dailyRate = planPrice / durationInDays;
    const usedAmountRaw = dailyRate * daysUsed;
    // If used value has decimals (e.g. 9.56), treat as next rupee (10)
    const usedAmount = Math.max(0, toIntRupeeCeil(usedAmountRaw));
    const remainingValue = Math.max(0, planPrice - usedAmount);

    const planDurationLabel = (currentPlan.planDuration as string) || "";

    return {
      planStartDate,
      planPrice,
      durationInDays,
      planDurationLabel,
      daysUsed,
      daysRemaining,
      dailyRate,
      usedAmount,
      remainingValue,
    };
  }, [currentPlan, today]);

  const adjustedAmount = useMemo(() => {
    if (!planMetrics || !selectedPlanDetails) return 0;
    const raw =
      Number(selectedPlanDetails.planPrice) - planMetrics.remainingValue;
    return Math.max(0, toIntRupeeFloor(raw));
  }, [planMetrics, selectedPlanDetails]);

  if (!planMetrics) {
    return null;
  }

  if (!selectedPlanDetails) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        disablePortal={false}
        sx={{ zIndex: 13000 }}
      >
        <div className="p-6 text-center">
          <p className="text-gray-500">No plan selected for upgrade</p>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      disablePortal={false}
      sx={{ zIndex: 13000 }}
    >
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Update Plan
        </h2>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Current Plan Details
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Plan Name:</span>
              <span className="ml-2 font-medium">
                {(currentPlan.planName as string) || "-"}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Plan Price:</span>
              <span className="ml-2 font-medium">
                ₹{formatRsInt(planMetrics.planPrice)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-medium">
                {new Date(planMetrics.planStartDate).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Duration:</span>
              <span className="ml-2 font-medium">
                {planMetrics.durationInDays} days
                {planMetrics.planDurationLabel
                  ? ` (${planMetrics.planDurationLabel})`
                  : ""}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Days Used:</span>
              <span className="ml-2 font-medium text-amber-600">
                {planMetrics.daysUsed} days
              </span>
            </div>
            <div>
              <span className="text-gray-600">Days Remaining:</span>
              <span className="ml-2 font-medium text-green-600">
                {planMetrics.daysRemaining} days
              </span>
            </div>
            <div>
              <span className="text-gray-600">Daily Rate:</span>
              <span className="ml-2 font-medium">
                ₹{formatRsInt(planMetrics.dailyRate)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Remaining Value:</span>
              <span className="ml-2 font-medium text-green-600">
                ₹{formatRsInt(planMetrics.remainingValue)}
              </span>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Upgrade To Plan
          </h3>
          <div className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h4 className="text-base font-semibold text-primary-main mb-1">
                  {selectedPlanDetails.planName}
                </h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>
                    Duration:{" "}
                    {selectedPlanDetails.durationInDays != null
                      ? `${selectedPlanDetails.durationInDays} days`
                      : "-"}
                  </p>
                  <p>
                    Allowed Tiffin:{" "}
                    {selectedPlanDetails.totalTiffinsAllowed ?? "-"}
                  </p>
                  <p>
                    Allowed Customers:{" "}
                    {selectedPlanDetails.noOfCustomers ?? "-"}
                  </p>
                </div>
                {selectedPlanDetails.description && (
                  <p className="text-xs text-gray-600 mt-2">
                    {selectedPlanDetails.description}
                  </p>
                )}
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-gray-800 mb-2">
                  ₹{formatRsInt(selectedPlanDetails.planPrice)}
                </div>
                <div className="text-xs text-gray-500">
                  <div>
                    Remaining Value: ₹{formatRsInt(planMetrics.remainingValue)}
                  </div>
                  <div className="mt-1 font-semibold text-primary-main">
                    Adjusted Amount: ₹{formatRsInt(adjustedAmount)}
                  </div>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onUpdatePlan(selectedPlanDetails, adjustedAmount)}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-primary-main text-white rounded hover:bg-primary-dark disabled:opacity-60 transition"
            >
              {isLoading ? "Processing..." : "Upgrade to This Plan"}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onUpdatePlan(selectedPlanDetails, adjustedAmount)}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-md font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            {isLoading ? "Processing..." : "Update Plan"}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default UpdatePlanModal;
