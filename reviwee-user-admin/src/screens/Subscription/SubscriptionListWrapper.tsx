import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "src/redux/store";
import type { BillingDetailsFormValues } from "src/models/Profile.model";
import type { InvoiceListItem } from "src/models/Invoice.model";
import {
  setPage,
  setRowsPerPage,
  setSearchValue,
  setIsTableLoading,
  setItems,
  setTotalItems,
} from "src/redux/slices/SubscriptionSlice";
import {
  getApiMessage,
  showToast,
} from "src/utils/validations/showToaster";
import {
  useGetAllSubscriptionPlanDataQuery,
  useGetActivePackageQuery,
  useGetInvoiceListQuery,
  useAddActivePackageMutation,
  useVerifyPaymentMutation,
  useRenewSubscriptionByIdMutation,
  useUpgradeActivePackageByIdMutation,
  useUpdateInvoiceGstDetailsMutation,
} from "src/services/SubscriptionPlanService";
import {
  useGetProfileQuery,
} from "src/services/UserService";
import type { SubscriptionPlanListItem } from "src/models/SubscriptionPlan.model";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import SubscriptionList from "./SubscriptionList";
import BillingDetailsModal from "./BillingDetailsModal";
import SubscriptionCheckoutPage from "./components/SubscriptionCheckoutPage";
import { handleRedirect } from "src/utils/redirectHelper";

type LayoutVariant = "app" | "onboarding";
type Props = {
  layoutVariant?: LayoutVariant;
};

type PendingAction =
  | { type: "BUY"; plan: SubscriptionPlanListItem }
  | { type: "RENEW"; plan: SubscriptionPlanListItem }
  | {
    type: "UPDATE";
    plan: SubscriptionPlanListItem;
    adjustedAmount: number;
  };

const EMPTY_BILLING_VALUES: BillingDetailsFormValues = {
  gst_number: "",
  gst_billing_name: "",
  email: "",
  mobile: "",
  address_line1: "",
  state: "",
  city: "",
  pincode: "",
};

const toText = (value: unknown): string =>
  typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();

const normalizeBillingValues = (
  values: BillingDetailsFormValues,
): BillingDetailsFormValues => ({
  gst_number: toText(values.gst_number).toUpperCase(),
  gst_billing_name: toText(values.gst_billing_name),
  email: toText(values.email),
  mobile: toText(values.mobile),
  address_line1: toText(values.address_line1),
  state: toText(values.state),
  city: toText(values.city),
  pincode: toText(values.pincode),
});

const mapProfileToBillingValues = (
  profileData: Record<string, unknown> | null,
): BillingDetailsFormValues => {
  if (!profileData) return EMPTY_BILLING_VALUES;
  const gstDetails =
    profileData.gstDetails &&
      typeof profileData.gstDetails === "object" &&
      !Array.isArray(profileData.gstDetails)
      ? (profileData.gstDetails as Record<string, unknown>)
      : null;

  const profileName = toText(profileData.gst_billing_name ?? profileData.name);

  return normalizeBillingValues({
    gst_number: toText(
      profileData.gst_number ?? gstDetails?.gstNumber ?? gstDetails?.gst_number,
    ),
    gst_billing_name: profileName,
    email: toText(profileData.email),
    mobile: toText(profileData.mobile ?? gstDetails?.mobile),
    address_line1: toText(
      profileData.address_line1 ?? gstDetails?.address ?? gstDetails?.address_line1,
    ),
    state: toText(profileData.state ?? gstDetails?.state),
    city: toText(profileData.city ?? gstDetails?.city),
    pincode: toText(profileData.pincode ?? gstDetails?.pincode),
  });
};

const isBillingComplete = (values: BillingDetailsFormValues): boolean => {
  const v = normalizeBillingValues(values);
  return Boolean(
    v.gst_billing_name ||
    v.gst_number ||
    v.email ||
    v.mobile ||
    v.address_line1 ||
    v.state ||
    v.city ||
    v.pincode,
  );
};

const normalizeInvoices = (raw: unknown): InvoiceListItem[] => {
  if (!raw) return [];
  const root = raw as Record<string, unknown>;
  const source =
    (Array.isArray(root.data) && root.data) ||
    (Array.isArray(root.invoices) && root.invoices) ||
    (Array.isArray(raw) ? raw : []);

  return (source as Record<string, unknown>[])
    .map((item) => {
      const totalAmountRaw = item.totalAmount ?? item.grandTotal ?? item.taxableAmount ?? "";
      const totalAmount =
        typeof totalAmountRaw === "number" || typeof totalAmountRaw === "string"
          ? totalAmountRaw
          : "";
      return {
        ...item,
        id: toText(item.id ?? item._id ?? item.invoiceId),
        invoiceNumber: toText(item.invoiceNumber ?? item.invoiceNo),
        invoiceDate: toText(item.invoiceDate ?? item.date ?? item.createdAt),
        planName: toText(item.planName ?? item.subscriptionPlanName),
        paymentStatus: toText(item.paymentStatus ?? item.status),
        downloadUrl: toText(item.downloadUrl ?? item.invoiceUrl ?? item.pdfUrl),
        totalAmount,
      };
    })
    .filter((item) => item.id || item.invoiceNumber || item.downloadUrl);
};

const extractInvoicesFromGstUpdateResponse = (raw: unknown): InvoiceListItem[] => {
  if (!raw || typeof raw !== "object") return [];
  const root = raw as Record<string, unknown>;
  const normalized = normalizeInvoices(
    root.data ?? root.invoice ?? root.invoices ?? raw,
  );
  if (normalized.length > 0) return normalized;
  return normalizeInvoices(raw);
};

const mergeInvoiceLists = (
  first: InvoiceListItem[],
  second: InvoiceListItem[],
): InvoiceListItem[] => {
  const seen = new Set<string>();
  const result: InvoiceListItem[] = [];
  for (const item of [...first, ...second]) {
    const key = toText(item.id ?? item.invoiceId ?? item.invoiceNumber ?? item.invoiceNo);
    if (!key) {
      result.push(item);
      continue;
    }
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatAmount = (value: unknown): string => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "0.00";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const buildInvoiceHtml = (invoice: InvoiceListItem): string => {
  const invoiceNumber = escapeHtml(toText(invoice.invoiceNumber ?? invoice.invoiceNo) || "—");
  const invoiceDate = escapeHtml(toText(invoice.invoiceDate ?? invoice.date) || "—");
  const userName = escapeHtml(toText(invoice.userName) || "Customer");
  const email = escapeHtml(toText(invoice.email) || "—");
  const planName = escapeHtml(toText(invoice.planName) || "Subscription Plan");
  const status = escapeHtml(toText(invoice.paymentStatus ?? invoice.status) || "SUCCESS");
  const gst = invoice.gstDetails ?? {};
  const seller = invoice.invoiceSellerDetails ?? {};
  const sellerAddress = seller.address ?? {};
  const sellerTax = seller.taxDetails ?? {};
  const sellerBank = seller.bankDetails ?? {};

  const addressParts = [toText(gst.address), toText(gst.city), toText(gst.state), toText(gst.pincode)]
    .filter(Boolean)
    .join(", ");
  const billedAddress = escapeHtml(addressParts || "—");
  const billedMobile = escapeHtml(toText(gst.mobile) || "—");
  const billedGst = escapeHtml(toText(gst.gstNumber) || "—");
  const billedCityState = escapeHtml(
    [toText(gst.city), toText(gst.state), toText(gst.pincode)].filter(Boolean).join(" "),
  );
  const subTotal = formatAmount(invoice.subTotal ?? invoice.planPrice ?? invoice.taxableAmount ?? 0);
  const gstPercentage = formatAmount(invoice.gstPercentage ?? 18);
  const gstAmount = formatAmount(invoice.gstAmount ?? 0);
  const totalAmount = formatAmount(invoice.totalAmount ?? invoice.grandTotal ?? invoice.taxableAmount ?? 0);
  const invoiceDateValue = toText(invoice.invoiceDate ?? invoice.date);
  const dueDateParsed = invoiceDateValue ? new Date(invoiceDateValue) : null;
  if (dueDateParsed && !Number.isNaN(dueDateParsed.getTime())) {
    dueDateParsed.setDate(dueDateParsed.getDate() + 30);
  }
  const dueDate = escapeHtml(
    dueDateParsed && !Number.isNaN(dueDateParsed.getTime())
      ? dueDateParsed.toLocaleDateString("en-GB")
      : invoiceDate,
  );

  const sellerName = escapeHtml(toText(seller.sellerName) || "Seller");
  const sellerAddressLines = [
    toText(sellerAddress.line1),
    toText(sellerAddress.line2),
    [toText(sellerAddress.city), toText(sellerAddress.state)].filter(Boolean).join(" "),
    [toText(sellerAddress.country), toText(sellerAddress.pincode)].filter(Boolean).join(" "),
  ].filter(Boolean);
  const sellerGst = escapeHtml(toText(sellerTax.gstNumber) || "—");
  const sellerStateCode = escapeHtml(toText(sellerTax.gstStateCode) || "—");
  const sellerAddressHtml = sellerAddressLines
    .map((line) => escapeHtml(line))
    .join("<br/>");

  const bankAccountName = escapeHtml(toText(sellerBank.accountHolderName) || "—");
  const bankName = escapeHtml(toText(sellerBank.bankName) || "—");
  const bankAccountNumber = escapeHtml(toText(sellerBank.accountNumber) || "—");
  const bankIfsc = escapeHtml(toText(sellerBank.ifscCode) || "—");
  const bankSwift = escapeHtml(toText(sellerBank.swiftCode) || "—");
  const bankUpi = escapeHtml(toText(sellerBank.UPI) || "—");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${invoiceNumber}</title>
  <style>
    :root { color-scheme: light; }
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: #eef2f7;
      color: #1f2937;
    }
    .actions {
      position: sticky;
      top: 0;
      z-index: 5;
      display: flex;
      gap: 8px;
      justify-content: flex-start;
      padding: 12px 18px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
    }
    .actions button {
      border: 1px solid #cbd5e1;
      background: #ffffff;
      padding: 7px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 12px;
      font-weight: 600;
    }
    .canvas {
      display: flex;
      justify-content: center;
      padding: 18px;
    }
    .sheet {
      width: 210mm;
      min-height: 297mm;
      background: #ffffff;
      box-shadow: 0 18px 45px rgba(15, 23, 42, 0.14);
      padding: 14mm;
    }
    .top {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
      align-items: start;
    }
    .muted { color: #6b7280; font-size: 12px; line-height: 1.45; }
    .seller-title { font-size: 26px; margin: 0 0 8px 0; font-weight: 700; }
    .invoice-meta { text-align: right; font-size: 13px; line-height: 1.55; }
    .status { display: inline-block; border: 1px solid #d1d5db; border-radius: 999px; padding: 2px 10px; font-size: 11px; font-weight: 700; margin-bottom: 8px; }
    .section-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 14px;
      border-top: 1px solid #e5e7eb;
      border-bottom: 1px solid #e5e7eb;
      padding: 12px 0;
      margin-bottom: 12px;
    }
    .section-title { font-size: 12px; color: #6b7280; margin-bottom: 6px; }
    .strong { font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    thead tr { border-bottom: 1px solid #d1d5db; }
    th, td { padding: 8px 6px; font-size: 12px; text-align: left; vertical-align: top; }
    tbody tr { border-bottom: 1px solid #edf2f7; }
    .amount { text-align: right; }
    .totals {
      margin-left: auto;
      width: 320px;
      margin-top: 10px;
      border-collapse: collapse;
    }
    .totals td { font-size: 13px; padding: 7px 0; border-bottom: 1px solid #edf2f7; }
    .totals td:last-child { text-align: right; }
    .totals .grand td { font-weight: 700; border-top: 1px solid #cbd5e1; border-bottom: none; padding-top: 10px; }
    .offline {
      margin-top: 22px;
      border-top: 1px solid #e5e7eb;
      padding-top: 12px;
      font-size: 12px;
      color: #4b5563;
      line-height: 1.55;
    }
    @media print {
      body { background: #ffffff; }
      .actions { display: none; }
      .canvas { display: block; padding: 0; }
      .sheet {
        width: auto;
        min-height: auto;
        box-shadow: none;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="actions">
    <button onclick="window.print()">Download / Print</button>
  </div>
  <div class="canvas">
    <div class="sheet">
      <div class="top">
        <div>
          <h1 class="seller-title">Reviwee</h1>
          <div class="strong">${sellerName}</div>
          <div class="muted">
           
            ${sellerAddressHtml || "—"}<br/>
            GST Number: ${sellerGst}<br/>
            GST state code: ${sellerStateCode}
          </div>
        </div>
        <div class="invoice-meta">
          <div class="status">${status}</div><br/>
          <div class="strong">Invoice Date: ${invoiceDate}</div>
          <div>Due Date: ${dueDate}</div>
        </div>
      </div>

      <div class="section-grid">
        <div>
          <div class="section-title">Bill To:</div>
          <div class="strong">${userName}</div>
          <div class="muted">${billedAddress}</div>
          <div class="muted">Email: ${email}</div>
          <div class="muted">Mobile: ${billedMobile}</div>
          <div class="muted">GST Number: ${billedGst}</div>
          <div class="muted">${billedCityState}</div>
        </div>
        <div>
          <div class="section-title">Invoice Details</div>
          <div class="muted">Invoice No: <span class="strong">${invoiceNumber}</span></div>
          <div class="muted">Invoice Date: ${invoiceDate}</div>
          <div class="muted">Payment Status: ${status}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Qty</th>
            <th class="amount">Rate</th>
            <th class="amount">Tax</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>${planName}</td>
            <td>1</td>
            <td class="amount">₹${subTotal}</td>
            <td class="amount">IGST ${gstPercentage}%</td>
            <td class="amount">₹${subTotal}</td>
          </tr>
        </tbody>
      </table>

      <table class="totals">
        <tr><td>Sub Total</td><td>₹${subTotal}</td></tr>
        <tr><td>IGST (${gstPercentage}%)</td><td>₹${gstAmount}</td></tr>
        <tr class="grand"><td>Total</td><td>₹${totalAmount}</td></tr>
        <tr><td style="color:#ef4444;font-weight:700;">Amount Due</td><td style="color:#ef4444;font-weight:700;">₹${totalAmount}</td></tr>
      </table>

      <div class="offline">
        <div class="strong" style="margin-bottom:6px;">Offline Payment</div>
        <div>Bank</div>
        <div>Acc Name: ${bankAccountName}</div>
        <div>Acc Number: ${bankAccountNumber}</div>
        <div>IFSC Number: ${bankIfsc}</div>
        <div>SWIFT Code: ${bankSwift}</div>
        <div>Bank Name: ${bankName}</div>
        <div>UPI: ${bankUpi}</div>
      </div>
    </div>
  </div>
</body>
</html>`;
};

const SubscriptionListWrapper = ({ layoutVariant = "app" }: Props) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loadingPlanId, setLoadingPlanId] = React.useState<string | null>(null);
  const [loadingType, setLoadingType] = React.useState<
    "BUY" | "UPGRADE" | "RENEW" | "UPDATE" | null
  >(null);
  const [checkoutAction, setCheckoutAction] = React.useState<PendingAction | null>(null);
  const [isBillingModalOpen, setIsBillingModalOpen] = React.useState(false);
  const [billingValues, setBillingValues] = React.useState<BillingDetailsFormValues>(
    EMPTY_BILLING_VALUES,
  );
  const [pendingAction, setPendingAction] = React.useState<PendingAction | null>(null);
  const [isInvoiceSyncing, setIsInvoiceSyncing] = React.useState(false);
  const [hasBillingPromptHandled, setHasBillingPromptHandled] = React.useState(false);
  const [invoiceItemsFromGstUpdate, setInvoiceItemsFromGstUpdate] = React.useState<
    InvoiceListItem[]
  >([]);

  const { items, totalItems, page, rowsPerPage, searchValue, isTableLoading } =
    useSelector((state: RootState) => state.subscription);

  const { data: activePlan, refetch: refetchActivePlan } =
    useGetActivePackageQuery("");
  const activePlanData = activePlan?.data;
  const {
    data: profileRes,
    isFetching: profileFetching,
    refetch: refetchProfile,
  } = useGetProfileQuery(undefined);
  const [updateInvoiceGstDetails, { isLoading: savingBillingProfile }] =
    useUpdateInvoiceGstDetailsMutation();
  const {
    data: invoicesRes,
    isLoading: invoicesLoading,
    isFetching: invoicesFetching,
    error: invoicesError,
    refetch: refetchInvoices,
  } = useGetInvoiceListQuery(undefined);

  useEffect(() => {
    if (layoutVariant !== "onboarding") return;
    if (!activePlanData) return;
    navigate("/onboarding/business-profile-add", { replace: true });
  }, [layoutVariant, activePlanData, navigate]);

  const profileRecord = useMemo(() => {
    const root = profileRes as
      | { data?: Record<string, unknown> }
      | Record<string, unknown>
      | undefined;
    if (!root || typeof root !== "object") return null;
    if (root.data && typeof root.data === "object" && !Array.isArray(root.data)) {
      return root.data as Record<string, unknown>;
    }
    return root as Record<string, unknown>;
  }, [profileRes]);

  const invoices = useMemo(
    () =>
      mergeInvoiceLists(
        invoiceItemsFromGstUpdate,
        normalizeInvoices(invoicesRes),
      ),
    [invoiceItemsFromGstUpdate, invoicesRes],
  );

  useEffect(() => {
    if (!profileRecord) return;
    setBillingValues(mapProfileToBillingValues(profileRecord));
  }, [profileRecord]);

  const payload = useMemo(
    () => ({
      limit: rowsPerPage,
      searchValue,
      params: ["planName"],
      page,
      filterBy: [] as { fieldName: string; value: string[] }[],
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
      orderBy: "planPrice",
      orderByValue: 1 as const,
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, searchValue],
  );

  const existingCredits = useMemo(() => {
    if (!activePlanData) return 0;
    const keys = [
      "remainingCredits",
      "balanceCredits",
      "availableCredits",
      "credits",
      "currentCredits",
    ] as const;
    for (const key of keys) {
      const value = activePlanData[key];
      const numeric = typeof value === "number" ? value : Number(value);
      if (Number.isFinite(numeric) && numeric > 0) return numeric;
    }
    return 0;
  }, [activePlanData]);

  const { data, isLoading, isFetching } =
    useGetAllSubscriptionPlanDataQuery(payload);

  const [addActivePackage] = useAddActivePackageMutation();
  const [verifyPayment] = useVerifyPaymentMutation();
  const [renewSubscription] = useRenewSubscriptionByIdMutation();
  const [upgradeActivePackage] = useUpgradeActivePackageByIdMutation();

  useEffect(() => {
    dispatch(setIsTableLoading(isLoading || isFetching));

    if (!isLoading && !isFetching) {
      dispatch(setItems(data?.data || []));
      dispatch(setTotalItems(data?.totalItem || 0));
    }
  }, [data, isLoading, isFetching, dispatch]);

  const today = new Date().toISOString().split("T")[0];

  const getDueDate = (startDate: string, days: number) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const syncInvoicesAfterPayment = async () => {
    setIsInvoiceSyncing(true);
    try {
      await refetchInvoices();
    } finally {
      setIsInvoiceSyncing(false);
    }
  };

  const getAdjustedAmountForUpdate = (plan: SubscriptionPlanListItem): number => {
    return Math.max(0, Number(plan.planPrice) || 0);
  };

  const openCheckout = (action: PendingAction) => {
    setCheckoutAction(action);
  };

  const handleDownloadInvoice = (invoice: InvoiceListItem) => {
    const html = buildInvoiceHtml(invoice);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const blobUrl = window.URL.createObjectURL(blob);
    const popup = window.open(blobUrl, "_blank");

    if (!popup) {
      window.URL.revokeObjectURL(blobUrl);
      showToast("error", "Please allow popups to open invoice");
      return;
    }

    // Release URL after tab has loaded the content.
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 3000);
  };

  const requireBillingBeforeAction = (next: PendingAction): boolean => {
    if (isBillingComplete(billingValues) || hasBillingPromptHandled) return true;
    setPendingAction(next);
    setIsBillingModalOpen(true);
    return false;
  };

  const handleBillingSubmit = async (nextValues: BillingDetailsFormValues) => {
    const payload = normalizeBillingValues(nextValues);
    const response = await updateInvoiceGstDetails({
      gstDetails: {
        gstNumber: payload.gst_number,
        address: payload.address_line1,
        mobile: payload.mobile,
        state: payload.state,
        city: payload.city,
        pincode: payload.pincode,
      },
    });
    const responseData = response as { data?: { status?: boolean; message?: string } };
    if (!responseData?.data?.status) {
      showToast("error", getApiMessage(response));
      return;
    }

    setBillingValues(payload);
    setHasBillingPromptHandled(true);
    setIsBillingModalOpen(false);
    const generated = extractInvoicesFromGstUpdateResponse(
      (response as { data?: unknown })?.data,
    );
    if (generated.length > 0) {
      setInvoiceItemsFromGstUpdate((prev) => mergeInvoiceLists(generated, prev));
    }
    showToast(
      "success",
      responseData?.data?.message || "GST details updated successfully",
    );
    void refetchProfile();
    void refetchInvoices();

    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);

    if (action.type === "BUY") {
      void handleRazorpayPayment(action.plan, true);
      return;
    }
    if (action.type === "RENEW") {
      void handleRenewSubscription(action.plan, true);
      return;
    }
    void handleUpdatePlan(action.plan, action.adjustedAmount, true);
  };

  const buildAddPayload = (plan: SubscriptionPlanListItem) => {
    const userId = localStorage.getItem("userId") || "";
    const durationInDays = Number(plan.durationInDays) || 30;
    const dueDate = getDueDate(today, durationInDays);
    return {
      customerId: userId,
      subscriptionPlanId: plan._id || plan.id,
      planStartDate: today,
      discountType: "NONE",
      discountValue: "0",
      receivedAmt: Number(plan?.planPrice || 0),
      dueDate,
      paymentMode: "RAZORPAY",
    };
  };

  const handleRazorpayPayment = async (
    plan: SubscriptionPlanListItem,
    skipBillingCheck = false,
  ) => {
    if (!skipBillingCheck && !requireBillingBeforeAction({ type: "BUY", plan })) {
      return;
    }
    try {
      setLoadingPlanId(plan._id || plan.id || "");
      setLoadingType("BUY");

      const userId = localStorage.getItem("userId");
      if (!userId) {
        showToast("error", "User not logged in. Please login again.");
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const payload = buildAddPayload(plan);

      if (Number(plan.planPrice) === 0) {
        const res = await addActivePackage(payload);

        if (
          (
            res as {
              data?: {
                status?: boolean;
                message?: string;
                redirectTo?: string;
              };
            }
          )?.data?.status
        ) {
          const resData = res as {
            data?: { message?: string; redirectTo?: string };
          };
          showToast("success", getApiMessage(res, "Free plan activated"));
          setCheckoutAction(null);
          setTimeout(() => refetchActivePlan(), 500);
          void syncInvoicesAfterPayment();
          const redirectTo = resData?.data?.redirectTo;
          if (redirectTo) {
            handleRedirect(redirectTo, navigate);
          }
        } else {
          showToast("error", getApiMessage(res));
        }

        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const orderRes = await addActivePackage(payload);
      const orderData = orderRes as {
        error?: unknown;
        data?: {
          status?: boolean;
          data?: {
            amount?: number;
            razorpayOrder?: { id?: string; receipt?: string };
          };
        };
      };

      if (orderData?.error || !orderData?.data?.status) {
        showToast("error", getApiMessage(orderRes));
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const rawOrder = (orderData?.data?.data ?? orderData?.data) as Record<
        string,
        unknown
      > | null;
      const razorpayOrder = rawOrder?.razorpayOrder as
        | {
          id?: string;
          orderId?: string;
          receipt?: string;
          data?: { id?: string; amount?: number; receipt?: string };
        }
        | undefined;
      const razorpayData = razorpayOrder?.data;
      const orderId =
        razorpayData?.id ??
        razorpayOrder?.id ??
        razorpayOrder?.orderId ??
        rawOrder?.order_id ??
        rawOrder?.orderId;
      const amountPaise =
        razorpayData?.amount ??
        rawOrder?.amount ??
        rawOrder?.totalAmount ??
        rawOrder?.total_amount;
      const receipt =
        razorpayData?.receipt ??
        razorpayOrder?.receipt ??
        rawOrder?.receipt ??
        rawOrder?.planId;

      if (!rawOrder || !orderId || !amountPaise) {
        console.error("Add subscription API response:", orderData);
        showToast("error", "Invalid order data received from server");
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: Number(amountPaise),
        currency: "INR",
        name: "Subscription",
        description: "Plan Purchase",
        order_id: orderId,

        handler: async (response: {
          razorpay_order_id?: string;
          razorpay_payment_id?: string;
          razorpay_signature?: string;
        }) => {
          const verifyRes = await verifyPayment({
            razorpay_order_id: response?.razorpay_order_id,
            razorpay_payment_id: response?.razorpay_payment_id,
            razorpay_signature: response?.razorpay_signature,
            planId: receipt,
          });

          const verifyData = verifyRes as {
            data?: { status?: boolean; message?: string; redirectTo?: string };
          };

          if (verifyData?.data?.status) {
            showToast(
              "success",
              verifyData?.data?.message || "Payment successful",
            );
            setCheckoutAction(null);
            void refetchActivePlan();
            void syncInvoicesAfterPayment();
            if (verifyData?.data?.redirectTo) {
              handleRedirect(verifyData.data.redirectTo, navigate);
            }
          } else {
            showToast("error", getApiMessage(verifyRes));
          }

          setLoadingPlanId(null);
          setLoadingType(null);
        },

        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
            setLoadingType(null);
          },
        },

        theme: { color: "#3399cc" },
      };

      const Razorpay = (window as any).Razorpay;
      if (Razorpay) {
        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
      } else {
        showToast("error", "Razorpay not loaded. Please refresh the page.");
        setLoadingPlanId(null);
        setLoadingType(null);
      }
    } catch (err) {
      showToast("error", getApiMessage(err));
      setLoadingPlanId(null);
      setLoadingType(null);
    }
  };

  const buildRenewPayload = (planPrice: number) => ({
    planStartDate: today,
    paymentMode: "RAZORPAY",
    discountType: "NONE",
    discountValue: "0",
    receivedAmt: planPrice,
    dueAmt: "0",
    dueDate: "",
  });

  const handleRenewSubscription = async (
    plan: SubscriptionPlanListItem,
    skipBillingCheck = false,
  ) => {
    if (!skipBillingCheck && !requireBillingBeforeAction({ type: "RENEW", plan })) {
      return;
    }
    try {
      setLoadingPlanId(plan._id || plan.id || "");
      setLoadingType("RENEW");

      if (!activePlanData?._id) {
        showToast("error", "No active subscription found");
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const payload = buildRenewPayload(Number(plan.planPrice) || 0);

      if (Number(plan.planPrice) === 0) {
        const res = await renewSubscription({
          id: activePlanData._id,
          body: payload,
        });

        const resData = res as {
          data?: { status?: boolean; message?: string; redirectTo?: string };
        };

        if (resData?.data?.status) {
          showToast(
            "success",
            resData?.data?.message || "Subscription renewed successfully",
          );
          setCheckoutAction(null);
          setTimeout(() => refetchActivePlan(), 500);
          void syncInvoicesAfterPayment();
          if (resData?.data?.redirectTo) {
            handleRedirect(resData.data.redirectTo, navigate);
          }
        } else {
          showToast("error", getApiMessage(res));
        }

        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const orderRes = await renewSubscription({
        id: activePlanData._id,
        body: payload,
      });

      type RenewOrder = {
        planId?: string;
        amount?: number;
        receipt?: string;
        razorpayOrder?: {
          id?: string;
          orderId?: string;
          receipt?: string;
          data?: {
            id?: string;
            amount?: number;
            receipt?: string;
          };
        };
      };

      const orderData = orderRes as {
        error?: unknown;
        data?: { status?: boolean; data?: RenewOrder };
      };

      if (orderData?.error || !orderData?.data?.status) {
        showToast("error", getApiMessage(orderRes));
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const order = orderData?.data?.data;
      const razorpayOrderData = order?.razorpayOrder?.data;

      if (!order || !razorpayOrderData?.id) {
        showToast("error", "Invalid order data received from server");
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const Razorpay = (window as any).Razorpay;
      if (!Razorpay) {
        showToast(
          "error",
          "Razorpay payment gateway not loaded. Please refresh the page.",
        );
        setLoadingPlanId(null);
        setLoadingType(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: Number(razorpayOrderData.amount) * 100,
        currency: "INR",
        name: "Subscription",
        description: "Plan Renewal",
        order_id: razorpayOrderData.id,

        handler: async (response: {
          razorpay_order_id?: string;
          razorpay_payment_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature,
              planId: order.planId,
            });

            const verifyData = verifyRes as {
              data?: {
                status?: boolean;
                message?: string;
                redirectTo?: string;
              };
            };

            if (verifyData?.data?.status) {
              showToast(
                "success",
                verifyData?.data?.message ||
                "Subscription renewed successfully",
              );
              setCheckoutAction(null);
              setTimeout(() => refetchActivePlan(), 1000);
              void syncInvoicesAfterPayment();
              if (verifyData?.data?.redirectTo) {
                handleRedirect(verifyData.data.redirectTo, navigate);
              }
            } else {
              showToast("error", getApiMessage(verifyRes));
            }
          } catch (verifyErr) {
            showToast("error", getApiMessage(verifyErr));
          } finally {
            setLoadingPlanId(null);
            setLoadingType(null);
          }
        },

        modal: {
          ondismiss: () => {
            setLoadingPlanId(null);
            setLoadingType(null);
          },
        },

        theme: { color: "#3399cc" },
      };

      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      showToast(
        "error",
        getApiMessage(err, "Failed to process renewal. Please try again."),
      );
      setLoadingPlanId(null);
      setLoadingType(null);
    }
  };

  const buildUpdatePayload = (
    plan: SubscriptionPlanListItem,
    adjustedAmount: number,
  ) => ({
    newPlanId: plan._id || plan.id,
    planStartDate: today,
    // Upgrades always charge the full selected plan amount.
    receivedAmt: Number(plan.planPrice) || adjustedAmount,
    discountType: "NONE",
    discountValue: "0",
    paymentMode: "RAZORPAY",
  });

  const handleUpdatePlan = async (
    selectedPlan: SubscriptionPlanListItem,
    adjustedAmount: number,
    skipBillingCheck = false,
  ) => {
    if (
      !skipBillingCheck &&
      !requireBillingBeforeAction({
        type: "UPDATE",
        plan: selectedPlan,
        adjustedAmount,
      })
    ) {
      return;
    }
    try {
      setLoadingType("UPDATE");

      if (!activePlanData?._id) {
        showToast("error", "No active subscription found");
        setLoadingType(null);
        return;
      }

      const payload = buildUpdatePayload(selectedPlan, adjustedAmount);

      const orderRes = await upgradeActivePackage({
        id: activePlanData._id,
        body: payload,
      });

      const orderResAny = orderRes as any;

      // Expected backend shape (based on your response):
      // { status: true, data: { paymentRequired, planId, payableAmount, razorpayOrder: { data: { id, amount_due }}}}
      const backendRes = orderResAny?.data ?? {};
      if (orderResAny?.error || backendRes?.status === false) {
        showToast(
          "error",
          getApiMessage(backendRes, getApiMessage(orderResAny)),
        );
        setLoadingType(null);
        return;
      }

      const upgradeData = backendRes?.data ?? {};
      const paymentRequiredRaw = upgradeData?.paymentRequired;

      const paymentRequiredFromFlag =
        paymentRequiredRaw === true ||
        paymentRequiredRaw === 1 ||
        paymentRequiredRaw === "1" ||
        (typeof paymentRequiredRaw === "string" &&
          paymentRequiredRaw.toLowerCase() === "true");

      const paymentRequiredFromFlagFalse =
        paymentRequiredRaw === false ||
        paymentRequiredRaw === 0 ||
        paymentRequiredRaw === "0" ||
        (typeof paymentRequiredRaw === "string" &&
          paymentRequiredRaw.toLowerCase() === "false");

      const razorpayOrderExists = Boolean(
        upgradeData?.razorpayOrder?.data?.id ||
        upgradeData?.razorpayOrder?.id ||
        upgradeData?.razorpayOrder?.order_id ||
        upgradeData?.razorpayOrder?.orderId,
      );

      // If backend explicitly says "paymentRequired", follow it.
      // Otherwise fallback to `razorpayOrder` presence.
      const paymentRequired =
        paymentRequiredRaw === undefined || paymentRequiredRaw === null
          ? razorpayOrderExists
          : paymentRequiredFromFlag
            ? true
            : paymentRequiredFromFlagFalse
              ? false
              : razorpayOrderExists;

      // If backend says no payment needed, treat as successful update.
      if (!paymentRequired) {
        showToast(
          "success",
          backendRes?.message ||
          upgradeData?.message ||
          getApiMessage(backendRes, "Plan updated successfully"),
        );
        setCheckoutAction(null);
        setTimeout(() => refetchActivePlan(), 500);
        void syncInvoicesAfterPayment();
        setLoadingType(null);
        return;
      }

      const razorpayOrderPayload =
        upgradeData?.razorpayOrder?.data ?? upgradeData?.razorpayOrder;

      const orderId =
        razorpayOrderPayload?.id ??
        razorpayOrderPayload?.orderId ??
        razorpayOrderPayload?.order_id;

      const amountPaise =
        razorpayOrderPayload?.amount_due ??
        razorpayOrderPayload?.amount ??
        (upgradeData?.payableAmount != null
          ? Number(upgradeData.payableAmount) * 100
          : undefined);

      const planIdForVerify =
        upgradeData?.planId ??
        razorpayOrderPayload?.receipt ??
        razorpayOrderPayload?.planId;

      if (!orderId || !amountPaise) {
        showToast("error", "Invalid payment order data received from server");
        setLoadingType(null);
        return;
      }

      const options = {
        key: import.meta.env.VITE_APP_RAZORPAY_KEY_ID,
        amount: Number(amountPaise),
        currency: "INR",
        name: "Subscription",
        description: "Plan Update",
        order_id: orderId,
        handler: async (response: {
          razorpay_order_id?: string;
          razorpay_payment_id?: string;
          razorpay_signature?: string;
        }) => {
          try {
            const verifyRes = await verifyPayment({
              razorpay_order_id: response?.razorpay_order_id,
              razorpay_payment_id: response?.razorpay_payment_id,
              razorpay_signature: response?.razorpay_signature,
              planId: planIdForVerify,
            });

            const verifyData = verifyRes as {
              data?: {
                status?: boolean;
                message?: string;
                redirectTo?: string;
              };
            };

            if (verifyData?.data?.status) {
              showToast(
                "success",
                verifyData?.data?.message || "Plan updated successfully",
              );
              setCheckoutAction(null);
              void refetchActivePlan();
              void syncInvoicesAfterPayment();
              if (verifyData?.data?.redirectTo) {
                handleRedirect(verifyData.data.redirectTo, navigate);
              }
            } else {
              showToast("error", getApiMessage(verifyRes));
            }
          } finally {
            setLoadingType(null);
          }
        },

        modal: {
          ondismiss: () => {
            setLoadingType(null);
          },
        },

        theme: { color: "#3399cc" },
      };

      const Razorpay = (window as any).Razorpay;
      if (Razorpay) {
        const razorpayInstance = new Razorpay(options);
        razorpayInstance.open();
      } else {
        showToast("error", "Razorpay not loaded. Please refresh the page.");
        setLoadingType(null);
      }
    } catch (err) {
      showToast("error", getApiMessage(err));
      setLoadingType(null);
    }
  };

  if (layoutVariant === "onboarding" && activePlanData) {
    // useEffect will redirect; avoid showing subscription UI (no "other options").
    return null;
  }

  const invoicesLoadingState = invoicesLoading || invoicesFetching || isInvoiceSyncing;
  const invoiceErrorMessage = invoicesError ? "Unable to load invoices right now." : "";
  const invoiceStatusHint =
    !invoiceErrorMessage &&
      activePlanData &&
      !invoicesLoadingState &&
      invoices.length === 0
      ? "Invoice is being generated. Please refresh in a moment."
      : "";

  const content = (
    <>
      <SubscriptionList
        items={items}
        activePlanData={activePlanData}
        isLoading={isTableLoading}
        paginationProps={{
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (v) => dispatch(setPage(v)),
          setRowsPerPage: (v) => dispatch(setRowsPerPage(v)),
          setSearchValue: (v) => dispatch(setSearchValue(v)),
        }}
        loadingPlanId={loadingPlanId}
        loadingType={loadingType}
        uiVariant={layoutVariant === "onboarding" ? "onboarding" : "app"}
        onBuyNow={(plan) => openCheckout({ type: "BUY", plan })}
        onRenew={(plan) => openCheckout({ type: "RENEW", plan })}
        billingDetails={billingValues}
        onEditBilling={() => {
          setPendingAction(null);
          setIsBillingModalOpen(true);
        }}
        invoiceItems={invoices}
        invoicesLoading={invoicesLoadingState}
        invoiceErrorMessage={invoiceErrorMessage}
        invoiceStatusHint={invoiceStatusHint}
        onRefreshInvoices={() => {
          void refetchInvoices();
        }}
        onDownloadInvoice={handleDownloadInvoice}
        onUpgradeClick={(plan) => {
          openCheckout({
            type: "UPDATE",
            plan,
            adjustedAmount: getAdjustedAmountForUpdate(plan),
          });
        }}
      />

      {layoutVariant === "app" && (
        <BillingDetailsModal
          open={isBillingModalOpen}
          loading={savingBillingProfile || profileFetching}
          initialValues={billingValues}
          onClose={() => {
            setIsBillingModalOpen(false);
            setPendingAction(null);
          }}
          onSubmit={handleBillingSubmit}
        />
      )}
    </>
  );

  if (layoutVariant === "app" && checkoutAction?.plan) {
    const requiredBillingFields: (keyof BillingDetailsFormValues)[] = [
      "gst_billing_name",
      "email",
      "mobile",
      "address_line1",
      "state",
      "city",
      "pincode",
    ];
    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 md:px-8 md:py-5">
          <div className="mx-auto w-full max-w-[1320px]">
            <SubscriptionCheckoutPage
              actionType={checkoutAction.type}
              selectedPlan={checkoutAction.plan}
              adjustedAmount={
                checkoutAction.type === "UPDATE"
                  ? checkoutAction.adjustedAmount
                  : undefined
              }
              billingValues={billingValues}
              existingCredits={existingCredits}
              loading={Boolean(loadingType) || savingBillingProfile}
              onBillingChange={(key, value) => {
                setBillingValues((prev) => ({ ...prev, [key]: value }));
              }}
              onBack={() => {
                setCheckoutAction(null);
              }}
              onConfirm={async () => {
                const normalized = normalizeBillingValues(billingValues);
                const missing = requiredBillingFields.find((field) => !normalized[field]);
                if (missing) {
                  showToast("error", "Please fill all required billing details.");
                  return;
                }

                setBillingValues(normalized);
                setHasBillingPromptHandled(true);

                const billingReq = updateInvoiceGstDetails({
                  gstDetails: {
                    gstNumber: normalized.gst_number,
                    address: normalized.address_line1,
                    mobile: normalized.mobile,
                    state: normalized.state,
                    city: normalized.city,
                    pincode: normalized.pincode,
                  },
                });

                const actionReq =
                  checkoutAction.type === "BUY"
                    ? handleRazorpayPayment(checkoutAction.plan, true)
                    : checkoutAction.type === "RENEW"
                      ? handleRenewSubscription(checkoutAction.plan, true)
                      : handleUpdatePlan(
                        checkoutAction.plan,
                        checkoutAction.adjustedAmount,
                        true,
                      );

                const [billingRes] = await Promise.allSettled([billingReq, actionReq]);
                if (billingRes.status === "fulfilled") {
                  const responseData = billingRes.value as {
                    data?: { status?: boolean; message?: string };
                  };
                  if (!responseData?.data?.status) {
                    showToast("error", getApiMessage(billingRes.value));
                  } else {
                    showToast(
                      "success",
                      responseData?.data?.message || "Billing details updated",
                    );
                    void refetchProfile();
                  }
                } else {
                  showToast("error", getApiMessage(billingRes.reason));
                }
              }}
            />
          </div>
        </div>
    );
  }

  return layoutVariant === "onboarding" ? (
    <div className="flex h-screen w-screen flex-col bg-[#f6f8fc]">
      {content}
    </div>
  ) : (
    <SideNavLayout>{content}</SideNavLayout>
  );
};

export default SubscriptionListWrapper;
