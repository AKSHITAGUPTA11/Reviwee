import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { TransactionListPayload } from "../../../models/Transaction.model";
import {
  setTransactionIsTableLoading,
  setTransactionItems,
  setTransactionPage,
  setTransactionRowsPerPage,
  setTransactionSearchValue,
  setTransactionTotalItems,
  setTransactionDateFilter,
  setTransactionIsOpenFilterModal,
} from "../../../redux/slices/TransactionSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import { useGetTransactionListQuery } from "../../../services/TransactionService";
import TransactionListing from "./TransactionListing";
import DateFilterModal from "../../../components/UI/atoms/DateFilterModal/DateFilterModal";

const TransactionListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    dateFilter,
    isOpenFilterModal,
  } = useSelector((state: RootState) => state.transaction);

  const columns: columnTypes[] = [
    { field: "customerName", headerName: "Customer Name", flex: "flex-[1_1_0%]" },
    { field: "customerEmail", headerName: "Customer Email", flex: "flex-[1_1_0%]" },
    {
      field: "amount",
      headerName: "Amount",
      flex: "flex-[1_1_0%]",
      renderCell: (row: { amount?: number }) => `₹${row.amount ?? 0}`,
    },
    { field: "paymentMode", headerName: "Payment Mode", flex: "flex-[1_1_0%]" },
    { field: "paymentStatus", headerName: "Payment Status", flex: "flex-[1_1_0%]" },
    { field: "createdAt", headerName: "Date", flex: "flex-[1_1_0%]" },
   
  ];

  const payload: TransactionListPayload = useMemo(
    () => ({
      params: ["customerName"],
      searchValue,
      dateFilter: {
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        dateFilterKey: dateFilter.dateFilterKey || "createdAt",
      },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1,
      limit: rowsPerPage,
      page,
      filterBy: [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, searchValue, dateFilter]
  );

  const { data, isLoading, isFetching } = useGetTransactionListQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setTransactionIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>, idx: number) => {
        const id = String(s.id ?? s._id ?? idx);
        const isActiveVal = s.isActive ?? s.is_active;
        const createdAt = s.createdAt ?? s.created_at;
        const dateStr =
          typeof createdAt === "string"
            ? createdAt.split("T")[0]
            : createdAt ?? "-";
        return {
          id,
          customerName: String(s.customerName ?? s.customer_name ?? ""),
          customerEmail: String(s.customerEmail ?? s.customer_email ?? ""),
          amount: Number(s.amount ?? 0),
          paymentMode: String(s.paymentMode ?? s.payment_mode ?? "-"),
          paymentStatus: String(s.paymentStatus ?? s.payment_status ?? "-"),
          createdAt: dateStr,
          isActive: typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setTransactionItems(mapped));
      dispatch(
        setTransactionTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    } else {
      dispatch(setTransactionItems([]));
      dispatch(setTransactionTotalItems(0));
    }
    dispatch(setTransactionIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  const handleApplyFilter = (startDate: string, endDate: string) => {
    dispatch(
      setTransactionDateFilter({
        startDate,
        endDate,
        dateFilterKey: "createdAt",
      })
    );
  };

  const handleClearFilter = () => {
    dispatch(
      setTransactionDateFilter({
        startDate: "",
        endDate: "",
        dateFilterKey: "createdAt",
      })
    );
  };

  return (
    <>
      <TransactionListing
        columns={columns}
        rows={items}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setTransactionPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setTransactionRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setTransactionSearchValue(value)),
        }}
        onFilterClick={() => dispatch(setTransactionIsOpenFilterModal(true))}
      />

      <DateFilterModal
        open={isOpenFilterModal}
        onClose={() => dispatch(setTransactionIsOpenFilterModal(false))}
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
      />
    </>
  );
};

export default TransactionListingWrapper;
