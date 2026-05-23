import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../../redux/store";
import type { DuesListPayload } from "../../../models/Dues.model";
import {
  setDuesIsTableLoading,
  setDuesItems,
  setDuesPage,
  setDuesRowsPerPage,
  setDuesSearchValue,
  setDuesTotalItems,
  setDuesDateFilter,
  setDuesIsOpenFilterModal,
} from "../../../redux/slices/DuesSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import { useGetDuesListQuery } from "../../../services/DuesService";
import DuesListing from "./DuesListing";
import DateFilterModal from "../../../components/UI/atoms/DateFilterModal/DateFilterModal";

const DuesListingWrapper = () => {
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
  } = useSelector((state: RootState) => state.dues);

  const columns: columnTypes[] = [
    { field: "name", headerName: "Name", flex: "flex-[1_1_0%]" },
    { field: "email", headerName: "Email", flex: "flex-[1_1_0%]" },
    {
      field: "dueAmt",
      headerName: "Due Amount",
      flex: "flex-[1_1_0%]",
      renderCell: (row: { dueAmt?: number }) => `₹${row.dueAmt ?? 0}`,
    },
    { field: "dueDate", headerName: "Due Date", flex: "flex-[1_1_0%]" },
  ];

  const payload: DuesListPayload = useMemo(
    () => ({
      params: ["name"],
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

  const { data, isLoading, isFetching } = useGetDuesListQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setDuesIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>, idx: number) => {
        const id = String(s.id ?? s._id ?? idx);
        const isActiveVal = s.isActive ?? s.is_active;
        return {
          id,
          name: String(s.name ?? ""),
          email: String(s.email ?? ""),
          dueAmt: Number(s.dueAmt ?? s.due_amt ?? 0),
          dueDate: String(s.dueDate ?? s.due_date ?? "-"),
          isActive: typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setDuesItems(mapped));
      dispatch(
        setDuesTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    } else {
      dispatch(setDuesItems([]));
      dispatch(setDuesTotalItems(0));
    }
    dispatch(setDuesIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  const handleApplyFilter = (startDate: string, endDate: string) => {
    dispatch(
      setDuesDateFilter({
        startDate,
        endDate,
        dateFilterKey: "createdAt",
      })
    );
  };

  const handleClearFilter = () => {
    dispatch(
      setDuesDateFilter({
        startDate: "",
        endDate: "",
        dateFilterKey: "createdAt",
      })
    );
  };

  return (
    <>
      <DuesListing
        columns={columns}
        rows={items}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setDuesPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setDuesRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setDuesSearchValue(value)),
        }}
        onFilterClick={() => dispatch(setDuesIsOpenFilterModal(true))}
      />

      <DateFilterModal
        open={isOpenFilterModal}
        onClose={() => dispatch(setDuesIsOpenFilterModal(false))}
        startDate={dateFilter.startDate}
        endDate={dateFilter.endDate}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
      />
    </>
  );
};

export default DuesListingWrapper;
