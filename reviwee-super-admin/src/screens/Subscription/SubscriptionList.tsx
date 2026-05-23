type SubscriptionItem = {
  id: string;
  planName: string;
  price: string;
  status: "Active" | "Pending" | "Expired";
  validTill: string;
  features: string[];
  ctaLabel: string;
};

const subscriptions: SubscriptionItem[] = [
  {
    id: "SUB-001",
    planName: "Starter",
    price: "INR 999 / month",
    status: "Active",
    validTill: "31 Mar 2026",
    features: ["1 Business profile", "Email support", "Basic analytics"],
    ctaLabel: "Current Plan",
  },
  {
    id: "SUB-002",
    planName: "Growth",
    price: "INR 1,999 / month",
    status: "Pending",
    validTill: "15 Apr 2026",
    features: ["3 Business profiles", "Priority support", "Review automation"],
    ctaLabel: "Buy Now",
  },
  {
    id: "SUB-003",
    planName: "Enterprise",
    price: "INR 4,999 / month",
    status: "Expired",
    validTill: "28 Feb 2026",
    features: ["Unlimited profiles", "Dedicated manager", "Advanced insights"],
    ctaLabel: "Upgrade Now",
  },
];

const statusClass: Record<SubscriptionItem["status"], string> = {
  Active: "bg-emerald-100 text-emerald-700",
  Pending: "bg-amber-100 text-amber-700",
  Expired: "bg-rose-100 text-rose-700",
};

const SubscriptionList = () => {
  return (
    <div className="space-y-6 p-3 md:p-5">
      <section className="rounded-2xl bg-gradient-to-r from-[#0ea5e9] to-[var(--primary-main)] p-5 text-white shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight">Subscription Plans</h1>
        <p className="mt-1 text-sm text-white/90">
          Dummy subscription plans and their current status.
        </p>
        <p className="mt-3 text-xs text-white/80">
          Pick the right plan for your business growth.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {subscriptions.map((item) => (
          <article
            key={item.id}
            className={`rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 ${
              item.status === "Active"
                ? "border-[var(--primary-main)] ring-2 ring-[var(--primary-main)]/15"
                : "border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">{item.planName}</h2>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass[item.status]}`}
              >
                {item.status}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-slate-900">{item.price}</p>
            <p className="mt-1 text-xs text-slate-500">Valid till {item.validTill}</p>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {item.features.map((feature) => (
                <li
                  key={feature}
                  className="rounded-lg bg-slate-50 px-3 py-2 leading-5"
                >
                  {feature}
                </li>
              ))}
            </ul>

            <button
              type="button"
              className={`mt-5 h-10 w-full rounded-lg text-sm font-semibold transition-colors ${
                item.status === "Active"
                  ? "cursor-default border border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "bg-[var(--primary-main)] text-white hover:bg-[var(--primary-hover)]"
              }`}
              disabled={item.status === "Active"}
            >
              {item.ctaLabel}
            </button>
          </article>
        ))}
      </section>
    </div>
  );
};

export default SubscriptionList;
