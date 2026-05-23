import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import SideNavLayout from "../../../components/layouts/SideNavLayout/SideNavLayout";
import { useGetCustomerByIdQuery } from "../../../services/CustomerService";
import ProfileListingWrapper from "./Profile/ProfileListingWrapper";
import SubscriptionListingWrapper from "./Subscription/SubscriptionListingWrapper";
import LedgerListingWrapper from "./Ledger/LedgerListingWrapper";
import CreditLedgerListingWrapper from "./CreditLedger/CreditLedgerListingWrapper";

type TabType = "profile" | "subscription" | "ledger" | "credit-ledger";

const ViewCustomer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabType | null;
  const [activeTab, setActiveTab] = useState<TabType>(
    tabFromUrl &&
      ["profile", "subscription", "ledger", "credit-ledger"].includes(tabFromUrl)
      ? tabFromUrl
      : "profile"
  );

  useEffect(() => {
    if (
      tabFromUrl &&
      ["profile", "subscription", "ledger", "credit-ledger"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const { data, isLoading } = useGetCustomerByIdQuery(id ?? "", {
    skip: !id,
  });

  const source = (data?.data || data || {}) as Record<string, unknown>;
  const customer = {
    id: String(source?.id ?? source?._id ?? id ?? ""),
    name: String(source.name ?? source.userName ?? ""),
    email: String(source.email ?? ""),
    mobile: String(source.mobile ?? source.phone ?? ""),
    displayName: String(source.displayName ?? source.display_name ?? ""),
  };

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              Customer Details
            </h1>
            <button
              type="button"
              onClick={() => navigate("/customer")}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : (
            <>
              <div className="mb-6 grid gap-3 md:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Name</p>
                  <p className="text-sm font-medium text-slate-800">
                    {customer.name || customer.displayName || "-"}
                  </p>
                </div>
                <div className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">Email</p>
                  <p className="text-sm font-medium text-slate-800">
                    {customer.email || "-"}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="mb-4 flex gap-2 border-b border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("profile");
                    navigate(`/customer/view/${id}?tab=profile`, { replace: true });
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "profile"
                      ? "border-b-2 border-[var(--primary-main)] text-[var(--primary-main)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("subscription");
                    navigate(`/customer/view/${id}?tab=subscription`, { replace: true });
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "subscription"
                      ? "border-b-2 border-[var(--primary-main)] text-[var(--primary-main)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Subscription
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("ledger");
                    navigate(`/customer/view/${id}?tab=ledger`, { replace: true });
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "ledger"
                      ? "border-b-2 border-[var(--primary-main)] text-[var(--primary-main)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ledger
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("credit-ledger");
                    navigate(`/customer/view/${id}?tab=credit-ledger`, {
                      replace: true,
                    });
                  }}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeTab === "credit-ledger"
                      ? "border-b-2 border-[var(--primary-main)] text-[var(--primary-main)]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Credit Ledger
                </button>
              </div>

              {activeTab === "profile" && (
                <ProfileListingWrapper customerId={id} />
              )}

              {activeTab === "subscription" && (
                <SubscriptionListingWrapper customerId={id} />
              )}

              {activeTab === "ledger" && (
                <LedgerListingWrapper customerId={id} />
              )}
              {activeTab === "credit-ledger" && (
                <CreditLedgerListingWrapper customerId={id} />
              )}
            </>
          )}
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ViewCustomer;
