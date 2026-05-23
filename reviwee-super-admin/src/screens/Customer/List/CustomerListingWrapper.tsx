import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  CustomerListItem,
  CustomerListPayload,
} from "../../../models/Customer.model";
import {
  setCustomerIsTableLoading,
  setCustomerItems,
  setCustomerPage,
  setCustomerRowsPerPage,
  setCustomerSearchValue,
  setCustomerTotalItems,
} from "../../../redux/slices/CustomerSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import { useGetAllCustomerDataQuery } from "../../../services/CustomerService";
import CustomerListing from "./CustomerListing";
import ResetCustomerPasswordDialog from "./ResetCustomerPasswordDialog";

const CustomerListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [resetPasswordCustomer, setResetPasswordCustomer] =
    useState<CustomerListItem | null>(null);
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
  } = useSelector((state: RootState) => state.customer);

  const columns: columnTypes[] = [
    { field: "name", headerName: "Name", flex: "flex-[1_1_0%]" },
    { field: "email", headerName: "Email", flex: "flex-[1_1_0%]" },
    {
      field: "action",
      headerName: "Action",
      flex: "flex-[0_0_auto]",
      align: "center",
      renderCell: (row: CustomerListItem) => {
        const options = [
          {
            label: "Reset password",
            onClick: () => setResetPasswordCustomer(row),
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

  const payload: CustomerListPayload = useMemo(
    () => ({
      params: ["name", "email"],
      searchValue,
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1,
      limit: rowsPerPage,
      page,
      filterBy: [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [page, rowsPerPage, searchValue]
  );

  const { data, isLoading, isFetching } = useGetAllCustomerDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setCustomerIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        return {
          id,
          name: String(s.name ?? s.userName ?? ""),
          email: String(s.email ?? ""),
          mobile: String(s.mobile ?? s.phone ?? ""),
          isActive: s.isActive,
          displayName: String(s.displayName ?? s.display_name ?? ""),
        };
      });
      dispatch(setCustomerItems(mapped));
      dispatch(
        setCustomerTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    } else {
      dispatch(setCustomerItems([]));
      dispatch(setCustomerTotalItems(0));
    }
    dispatch(setCustomerIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <CustomerListing
        columns={columns}
        rows={items}
        onViewClick={(id) => navigate(`/customer/view/${id}`)}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setCustomerPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setCustomerRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setCustomerSearchValue(value)),
        }}
      />
      {resetPasswordCustomer ? (
        <ResetCustomerPasswordDialog
          customer={resetPasswordCustomer}
          onClose={() => setResetPasswordCustomer(null)}
        />
      ) : null}
    </>
  );
};

export default CustomerListingWrapper;
