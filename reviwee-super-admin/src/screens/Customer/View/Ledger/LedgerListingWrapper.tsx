import { useState, useMemo } from "react";
import { format } from "date-fns";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMLoadingButton from "src/components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import { useGetCustomerSubscriptionLedgerQuery } from "src/services/CustomerSubscriptionService";
import LedgerList, { type LedgerListItem } from "./LedgerList";
import PaymentInDialog from "./PaymentInDialog";

type Props = {
  customerId?: string;
};

const LedgerListingWrapper = ({ customerId }: Props) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isPaymentInOpen, setIsPaymentInOpen] = useState(false);

  const { data: ledgerData, isLoading } = useGetCustomerSubscriptionLedgerQuery(
    customerId ?? "",
    { skip: !customerId }
  );

  const ledgerList = useMemo(() => {
    const source = ledgerData?.data ?? [];
    const dataArray = Array.isArray(source) ? source : [];
    return dataArray.map((item: Record<string, unknown>, idx: number) => {
      const type = String(item.type ?? "").toUpperCase();
      const amount = Number(item.amount ?? 0);
      const isDebit = type === "DEBIT";
      return {
        id: String(item.id ?? item._id ?? idx),
        date: item.dueDate || item.createdAt
          ? format(new Date(String(item.dueDate || item.createdAt)), "dd-MMM-yyyy")
          : "-",
        description: String(item.remark ?? item.description ?? "-"),
        debit: isDebit ? amount : 0,
        credit: !isDebit ? amount : 0,
        isActive: Boolean(item.isActive ?? item.is_active ?? true),
      };
    });
  }, [ledgerData]);

  const totalDueAmt = Number(ledgerData?.dueAmt ?? ledgerData?.due_amt ?? 0);

  const totalItems = ledgerList.length;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return ledgerList.slice(start, start + rowsPerPage);
  }, [ledgerList, page, rowsPerPage]);

  const columns: columnTypes[] = [
    { field: "date", headerName: "Date", flex: "flex-[1_1_0%]" },
    { field: "description", headerName: "Description", flex: "flex-[2_2_0%]" },
    {
      field: "debit",
      headerName: "Debit",
      flex: "flex-[1_1_0%]",
      renderCell: (row: LedgerListItem) => `₹${row.debit ?? 0}`,
    },
    {
      field: "credit",
      headerName: "Credit",
      flex: "flex-[1_1_0%]",
      renderCell: (row: LedgerListItem) => `₹${row.credit ?? 0}`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {totalDueAmt > 0 && (
        <div className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
          <span>Total Due Amount: ₹{totalDueAmt.toLocaleString()}</span>
          <ATMLoadingButton
            onClick={() => setIsPaymentInOpen(true)}
            className="w-auto shrink-0 px-4"
          >
            Payment In
          </ATMLoadingButton>
        </div>
      )}
      <LedgerList
        columns={columns}
        rows={paginatedRows}
        paginationProps={{
          isLoading,
          totalItems,
          page,
          rowsPerPage,
          setPage,
          setRowsPerPage,
        }}
      />
      {!isLoading && ledgerList.length === 0 && (
        <div className="py-8 text-center text-slate-500">
          No ledger entries found
        </div>
      )}

      {isPaymentInOpen && customerId && (
        <PaymentInDialog
          customerId={customerId}
          totalDueAmt={totalDueAmt}
          onClose={() => setIsPaymentInOpen(false)}
        />
      )}
    </div>
  );
};

export default LedgerListingWrapper;
