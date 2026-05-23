import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Tooltip } from "@mui/material";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import { useGetAllProfileCreditLogsDataQuery } from "src/services/CustomerService";
import CreditLedgerList, {
  type CreditLedgerListItem,
} from "./CreditLedgerList";

type Props = {
  customerId?: string;
};

const CreditLedgerListingWrapper = ({ customerId }: Props) => {
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const listPayload = useMemo(
    () => ({
      params: ["businessDisplayName"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1 as const,
      limit: rowsPerPage,
      page,
      filterBy: customerId
        ? [{ fieldName: "userId", value: [customerId] }]
        : [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, customerId]
  );

  const { data, isLoading, isFetching } = useGetAllProfileCreditLogsDataQuery(
    listPayload,
    { skip: !customerId }
  );

  const rows: CreditLedgerListItem[] = useMemo(() => {
    const source = data?.data ?? [];
    if (!Array.isArray(source)) return [];

    return source.map((item: Record<string, unknown>, index: number) => {
      const createdAt = String(item.createdAt ?? item.created_at ?? "");
      const parsedDate = createdAt ? new Date(createdAt) : null;
      const isValidDate = parsedDate && !Number.isNaN(parsedDate.getTime());

      return {
        id: String(item.id ?? item._id ?? index),
        createdAt: isValidDate ? format(parsedDate, "dd-MMM-yyyy hh:mm a") : "-",
        previousCredits: Number(item.previousCredits ?? item.previous_credits ?? 0),
        deductedCredits: Number(item.deductedCredits ?? item.deducted_credits ?? 0),
        remainingCredits: Number(item.remainingCredits ?? item.remaining_credits ?? 0),
        actionType: String(
          item.actionType ?? item.action_type ?? item.transactionType ?? "-"
        ),
        reviewText: String(item.reviewText ?? item.review_text ?? "-"),
        description: String(item.description ?? item.remark ?? "-"),
        isActive: Boolean(item.isActive ?? item.is_active ?? false),
      };
    });
  }, [data]);

  const totalItems = data?.totalItem ?? data?.total ?? 0;

  const columns: columnTypes[] = [
    {
      field: "reviewText",
      headerName: "Review",
      flex: "flex-[3_3_0%]",
      renderCell: (row: CreditLedgerListItem) => {
        const text = row.reviewText || "-";
        return (
          <Tooltip title={text} placement="top">
            <div className="line-clamp-2 cursor-default w-full">{text}</div>
          </Tooltip>
        );
      },
    },
    {
      field: "deductedCredits",
      headerName: "Deducted",
      flex: "flex-[1_1_0%]",
      renderCell: (row: CreditLedgerListItem) => row.deductedCredits ?? 0,
    },
    {
      field: "remainingCredits",
      headerName: "Remaining",
      flex: "flex-[1_1_0%]",
      renderCell: (row: CreditLedgerListItem) => row.remainingCredits ?? 0,
    },
    { field: "createdAt", headerName: "Generated On", flex: "flex-[1_1_0%]" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <CreditLedgerList
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
      {!isLoading && !isFetching && rows.length === 0 && (
        <div className="py-6 text-center text-slate-500">
          No credit ledger entries found
        </div>
      )}
    </div>
  );
};

export default CreditLedgerListingWrapper;
