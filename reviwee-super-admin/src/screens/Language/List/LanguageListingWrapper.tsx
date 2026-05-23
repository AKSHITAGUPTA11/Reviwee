import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Switch, Tooltip } from "@mui/material";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  LanguageListItem,
  LanguageListPayload,
} from "../../../models/Language.model";
import {
  setLanguageIsOpenAddDialog,
  setLanguageIsOpenEditDialog,
  setLanguageIsTableLoading,
  setLanguageItems,
  setLanguagePage,
  setLanguageRowsPerPage,
  setLanguageSearchValue,
  setLanguageTotalItems,
  setSelectedLanguageId,
} from "../../../redux/slices/LanguageSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllLanguageDataQuery,
  useDeleteLanguageByIdMutation,
  useChangeStatusLanguageByIdMutation,
} from "../../../services/LanguageService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddLanguageWrapper from "../Add/AddLanguageWrapper";
import EditLanguageWrapper from "../Edit/EditLanguageWrapper";
import LanguageListing from "./LanguageListing";

const LanguageListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [deleteLanguage] = useDeleteLanguageByIdMutation();
  const [changeStatusLanguage] = useChangeStatusLanguageByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedLanguageId,
  } = useSelector((state: RootState) => state.language);

  const columns: columnTypes[] = [
    {
      field: "languageName",
      headerName: "Language Name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "languageDescription",
      headerName: "Language Description",
      flex: "flex-[2_2_0%]",
      renderCell: (row: LanguageListItem) => {
        const description = row.languageDescription || "";
        return (
          <Tooltip title={description} placement="top">
            <div className="line-clamp-2 cursor-default w-full">
              {description}
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: LanguageListItem) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Switch
            checked={row.isActive ?? false}
            onChange={() =>
              changeStatusLanguage({
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
      renderCell: (row: LanguageListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Language?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteLanguage(row.id).then((res) => {
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
              dispatch(setSelectedLanguageId(row.id));
              dispatch(setLanguageIsOpenEditDialog(true));
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

  const payload: LanguageListPayload = useMemo(
    () => ({
      params: ["languageName"],
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

  const { data, isLoading, isFetching } = useGetAllLanguageDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setLanguageIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const isActiveVal = s.isActive ?? s.is_active;
        return {
          id,
          languageName: String(s.languageName ?? s.language_name ?? ""),
          languageDescription: String(
            s.languageDescription ?? s.language_description ?? ""
          ),
          isActive:
            typeof isActiveVal === "boolean"
              ? isActiveVal
              : Boolean(isActiveVal),
        };
      });
      dispatch(setLanguageItems(mapped));
      dispatch(
        setLanguageTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    } else {
      dispatch(setLanguageItems([]));
      dispatch(setLanguageTotalItems(0));
    }
    dispatch(setLanguageIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <LanguageListing
        columns={columns}
        rows={items}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setLanguagePage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setLanguageRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setLanguageSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setLanguageIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddLanguageWrapper
          onClose={() => dispatch(setLanguageIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedLanguageId ? (
        <EditLanguageWrapper
          selectedLanguageId={selectedLanguageId}
          onClose={() => {
            dispatch(setLanguageIsOpenEditDialog(false));
            dispatch(setSelectedLanguageId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default LanguageListingWrapper;
