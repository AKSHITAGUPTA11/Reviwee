import type { BillingDetailsFormValues } from "src/models/Profile.model";
import type { InvoiceListItem } from "src/models/Invoice.model";

type Props = {
  billingDetails: BillingDetailsFormValues;
  onEditBilling: () => void;
  invoiceItems: InvoiceListItem[];
  invoicesLoading?: boolean;
  invoiceErrorMessage?: string;
  invoiceStatusHint?: string;
  onRefreshInvoices: () => void;
  onDownloadInvoice: (invoice: InvoiceListItem) => void;
};

const toText = (value: unknown) =>
  typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();

const formatCurrency = (value: unknown) => {
  const num = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(num)) return "—";
  return `₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getInvoiceDate = (item: InvoiceListItem) => {
  const raw = toText(item.invoiceDate ?? item.date);
  if (!raw) return "—";
  const dt = new Date(raw);
  if (Number.isNaN(dt.getTime())) return raw;
  return dt.toLocaleDateString();
};

const getInvoiceNumber = (item: InvoiceListItem) =>
  toText(item.invoiceNumber ?? item.invoiceNo) || "—";

const getInvoiceDownloadUrl = (item: InvoiceListItem) =>
  toText(item.downloadUrl ?? item.invoiceUrl ?? item.pdfUrl);

const BillingInvoicesSection = ({
  billingDetails,
  onEditBilling,
  invoiceItems,
  invoicesLoading = false,
  invoiceErrorMessage = "",
  invoiceStatusHint = "",
  onRefreshInvoices,
  onDownloadInvoice,
}: Props) => {
  const billingRows = [
    { label: "Billing name", value: billingDetails.gst_billing_name || "—" },
    { label: "GST number", value: billingDetails.gst_number || "—" },
    { label: "Email", value: billingDetails.email || "—" },
    { label: "Mobile", value: billingDetails.mobile || "—" },
    { label: "State", value: billingDetails.state || "—" },
    {
      label: "Address",
      value:
        billingDetails.address_line1 ||
        [billingDetails.city, billingDetails.state, billingDetails.pincode]
          .filter(Boolean)
          .join(", ") ||
        "—",
    },
  ];

  return (
    <section className="mb-4 grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-1">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Billing & GST details</h2>
          <button
            type="button"
            onClick={onEditBilling}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Edit
          </button>
        </div>
        <div className="space-y-2">
          {billingRows.map((row) => (
            <div key={row.label} className="flex items-start justify-between gap-3 text-xs">
              <span className="text-slate-500">{row.label}</span>
              <span className="max-w-[60%] text-right font-medium text-slate-700">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm xl:col-span-2">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-slate-900">Invoices</h2>
          <button
            type="button"
            onClick={onRefreshInvoices}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        {invoiceErrorMessage && (
          <p className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            {invoiceErrorMessage}
          </p>
        )}
        {invoiceStatusHint && (
          <p className="mb-2 rounded-md border border-sky-200 bg-sky-50 px-3 py-2 text-xs text-sky-700">
            {invoiceStatusHint}
          </p>
        )}

        {invoicesLoading ? (
          <p className="text-xs text-slate-500">Loading invoices...</p>
        ) : invoiceItems.length === 0 ? (
          <p className="text-xs text-slate-500">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-2 py-2 font-semibold">Invoice</th>
                  <th className="px-2 py-2 font-semibold">Date</th>
                  <th className="px-2 py-2 font-semibold">Plan</th>
                  <th className="px-2 py-2 font-semibold">Amount</th>
                  <th className="px-2 py-2 font-semibold">Status</th>
                  <th className="px-2 py-2 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.slice(0, 12).map((invoice) => {
                  const downloadUrl = getInvoiceDownloadUrl(invoice);
                  return (
                    <tr
                      key={invoice.id || getInvoiceNumber(invoice)}
                      className="border-t border-slate-100"
                    >
                      <td className="px-2 py-2 text-slate-700">{getInvoiceNumber(invoice)}</td>
                      <td className="px-2 py-2 text-slate-600">{getInvoiceDate(invoice)}</td>
                      <td className="px-2 py-2 text-slate-600">
                        {toText(invoice.planName) || "—"}
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        {formatCurrency(
                          invoice.totalAmount ?? invoice.grandTotal ?? invoice.taxableAmount,
                        )}
                      </td>
                      <td className="px-2 py-2 text-slate-600">
                        {toText(invoice.paymentStatus ?? invoice.status) || "—"}
                      </td>
                      <td className="px-2 py-2 text-right">
                        {downloadUrl || invoice.id || invoice._id || invoice.invoiceId ? (
                          <button
                            type="button"
                            onClick={() => onDownloadInvoice(invoice)}
                            className="rounded-md border border-slate-300 px-2 py-1 font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Download
                          </button>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default BillingInvoicesSection;
