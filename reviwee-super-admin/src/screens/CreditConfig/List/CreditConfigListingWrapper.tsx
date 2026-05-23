import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch } from "@mui/material";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  CreditConfigListItem,
  CreditConfigListPayload,
} from "../../../models/CreditConfig.model";
import {
  setCreditConfigIsOpenAddDialog,
  setCreditConfigIsOpenEditDialog,
  setCreditConfigIsTableLoading,
  setCreditConfigItems,
  setCreditConfigPage,
  setCreditConfigRowsPerPage,
  setCreditConfigSearchValue,
  setCreditConfigTotalItems,
  setSelectedCreditConfigId,
} from "../../../redux/slices/CreditConfigSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllCreditConfigDataQuery,
  useDeleteCreditConfigByIdMutation,
  useChangeStatusCreditConfigByIdMutation,
} from "../../../services/CreditConfigService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddCreditConfigWrapper from "../Add/AddCreditConfigWrapper";
import EditCreditConfigWrapper from "../Edit/EditCreditConfigWrapper";
import CreditConfigListing from "./CreditConfigListing";

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const CreditConfigListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteCreditConfig] = useDeleteCreditConfigByIdMutation();
  const [changeStatusCreditConfig] = useChangeStatusCreditConfigByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedCreditConfigId,
  } = useSelector((state: RootState) => state.creditConfig);

  const columns: columnTypes[] = [
    {
      field: "credit",
      headerName: "Credit",
      flex: "flex-[1_1_0%]",
      renderCell: (row: CreditConfigListItem) => String(row.credit),
    },
    {
      field: "minWords",
      headerName: "Min words",
      flex: "flex-[1_1_0%]",
      renderCell: (row: CreditConfigListItem) => String(row.minWords),
    },
    {
      field: "maxWords",
      headerName: "Max words",
      flex: "flex-[1_1_0%]",
      renderCell: (row: CreditConfigListItem) => String(row.maxWords),
    },
    {
      field: "isDefault",
      headerName: "Default",
      flex: "flex-[0.8_1_0%]",
      renderCell: (row: CreditConfigListItem) =>
        row.isDefault ? "Yes" : "No",
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: CreditConfigListItem) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={row.isActive ?? false}
            onChange={() =>
              changeStatusCreditConfig({
                id: row.id,
                body: { isActive: !row.isActive },
              }).then((res) => applyMutationToast(res))
            }
            color="primary"
          />
        </div>
      ),
    },
    {
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: CreditConfigListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this credit config?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteCreditConfig(row.id).then((res) => {
                  applyMutationToast(res);
                });
              }
            },
          });
        };

        const options = [
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedCreditConfigId(row.id));
              dispatch(setCreditConfigIsOpenEditDialog(true));
            },
          },
          { label: "Delete", onClick: handleDelete },
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

  const payload: CreditConfigListPayload = useMemo(
    () => ({
      params: ["createdAt"],
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

  const { data, isLoading, isFetching } = useGetAllCreditConfigDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setCreditConfigIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const isActiveVal = s.isActive ?? s.is_active;
        const isDefaultVal = s.isDefault ?? s.is_default;
        return {
          id,
          credit: toNum(s.credit ?? s.credit_score),
          minWords: toNum(s.minWords ?? s.min_words),
          maxWords: toNum(s.maxWords ?? s.max_words ?? s.maxWords),
          isDefault:
            typeof isDefaultVal === "boolean"
              ? isDefaultVal
              : Boolean(isDefaultVal),
          isActive:
            typeof isActiveVal === "boolean"
              ? isActiveVal
              : Boolean(isActiveVal),
        };
      });
      dispatch(setCreditConfigItems(mapped));
      dispatch(
        setCreditConfigTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    } else {
      dispatch(setCreditConfigItems([]));
      dispatch(setCreditConfigTotalItems(0));
    }
    dispatch(setCreditConfigIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <CreditConfigListing
        columns={columns}
        rows={items}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setCreditConfigPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setCreditConfigRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setCreditConfigSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setCreditConfigIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddCreditConfigWrapper
          onClose={() => dispatch(setCreditConfigIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedCreditConfigId ? (
        <EditCreditConfigWrapper
          selectedCreditConfigId={selectedCreditConfigId}
          onClose={() => {
            dispatch(setCreditConfigIsOpenEditDialog(false));
            dispatch(setSelectedCreditConfigId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default CreditConfigListingWrapper;
