type TabKey = "plans" | "billing";

type Props = {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
};

const SubscriptionTabs = ({ activeTab, onChange }: Props) => {
  return (
    <div className="mb-4 inline-flex rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
      <button
        type="button"
        onClick={() => onChange("plans")}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          activeTab === "plans"
            ? "bg-[var(--primary-main)] text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Plans
      </button>
      <button
        type="button"
        onClick={() => onChange("billing")}
        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
          activeTab === "billing"
            ? "bg-[var(--primary-main)] text-white"
            : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        Billing & Invoices
      </button>
    </div>
  );
};

export default SubscriptionTabs;
