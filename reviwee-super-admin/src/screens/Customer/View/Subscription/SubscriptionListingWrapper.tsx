import { useState, useMemo } from "react";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "src/components/UI/atoms/ATMMenu/ATMMenu";
import ATMLoadingButton from "src/components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import {
  useGetCustomerSubscriptionListQuery,
} from "src/services/CustomerSubscriptionService";
import SubscriptionList, {
  type SubscriptionListItem,
} from "./SubscriptionList";
import AddCustomerSubscriptionDialog from "./AddCustomerSubscriptionDialog";
import RenewCustomerSubscriptionDialog from "./RenewCustomerSubscriptionDialog";

type Props = {
  customerId?: string;
};

const SubscriptionListingWrapper = ({ customerId }: Props) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [renewSubscription, setRenewSubscription] =
    useState<SubscriptionListItem | null>(null);

  const listPayload = useMemo(
    () => ({
      params: ["planName", "customerName"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1 as const,
      limit: rowsPerPage,
      page,
      filterBy: customerId
        ? [{ fieldName: "customerId", value: [customerId] }]
        : [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, customerId]
  );

  const { data, isLoading, isFetching } =
    useGetCustomerSubscriptionListQuery(listPayload, {
      skip: !customerId,
    });

  const rows: SubscriptionListItem[] = useMemo(() => {
    const source = data?.data ?? [];
    if (!Array.isArray(source)) return [];
    return source.map((s: Record<string, unknown>) => ({
      id: String(s.id ?? s._id ?? ""),
      planName: String(s.planName ?? s.plan_name ?? ""),
      planPrice: String(s.planPrice ?? s.plan_price ?? "0"),
      amtAfterDiscount: Number(s.amtAfterDiscount ?? s.amt_after_discount ?? s.planPrice ?? s.plan_price ?? 0),
      planStartDate: String(s.planStartDate ?? s.plan_start_date ?? ""),
      planExpiryDate: String(s.planExpiryDate ?? s.plan_expiry_date ?? ""),
      planStatus: String(s.planStatus ?? s.plan_status ?? ""),
      paymentStatus: String(s.paymentStatus ?? s.payment_status ?? ""),
      receivedAmt: Number(s.receivedAmt ?? s.received_amt ?? 0),
      dueAmt: Number(s.dueAmt ?? s.due_amt ?? 0),
      isActive: Boolean(s.isActive ?? s.is_active ?? false),
    }));
  }, [data]);

  const totalItems = data?.totalItem ?? data?.total ?? 0;

  const columns: columnTypes[] = [
    { field: "planName", headerName: "Plan", flex: "flex-[1_1_0%]" },
    {
      field: "planPrice",
      headerName: "Price",
      flex: "flex-[1_1_0%]",
      renderCell: (row: SubscriptionListItem) => `₹${row.planPrice ?? "0"}`,
    },
    {
      field: "planStartDate",
      headerName: "Start Date",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "planExpiryDate",
      headerName: "Expiry Date",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "planStatus",
      headerName: "Plan Status",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "paymentStatus",
      headerName: "Payment Status",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "receivedAmt",
      headerName: "Received",
      flex: "flex-[1_1_0%]",
      renderCell: (row: SubscriptionListItem) => `₹${row.receivedAmt ?? 0}`,
    },
    {
      field: "dueAmt",
      headerName: "Due",
      flex: "flex-[1_1_0%]",
      renderCell: (row: SubscriptionListItem) => `₹${row.dueAmt ?? 0}`,
    },
    {
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: SubscriptionListItem) => {
        const options = [
          {
            label: "Renew",
            onClick: () => setRenewSubscription(row),
          },
        ];
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ATMMenu
              options={options}
              orientation="vertical"
              triggerVariant="dots"
            />
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-slate-700">
          Customer Subscriptions
        </h3>
        <ATMLoadingButton
          onClick={() => setIsAddOpen(true)}
          className="w-auto shrink-0 px-4"
        >
          Add New
        </ATMLoadingButton>
      </div>

      <SubscriptionList
        columns={columns}
        rows={rows}
        paginationProps={{
          isTableLoading: isLoading || isFetching,
          totalItems,
          page,
          rowsPerPage,
          setPage,
          setRowsPerPage,
        }}
      />

      {isAddOpen && customerId && (
        <AddCustomerSubscriptionDialog
          customerId={customerId}
          onClose={() => setIsAddOpen(false)}
        />
      )}

      {renewSubscription && (
        <RenewCustomerSubscriptionDialog
          subscription={renewSubscription}
          onClose={() => setRenewSubscription(null)}
        />
      )}
    </div>
  );
};

export default SubscriptionListingWrapper;
