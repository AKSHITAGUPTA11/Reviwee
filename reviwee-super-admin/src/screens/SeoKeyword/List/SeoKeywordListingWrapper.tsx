import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  SeoKeywordListItem,
  SeoKeywordListPayload,
} from "../../../models/SeoKeyword.model";
import {
  setSeoKeywordIsOpenAddDialog,
  setSeoKeywordIsOpenEditDialog,
  setSeoKeywordIsTableLoading,
  setSeoKeywordItems,
  setSeoKeywordPage,
  setSeoKeywordRowsPerPage,
  setSeoKeywordSearchValue,
  setSeoKeywordTotalItems,
  setSelectedSeoKeywordId,
} from "../../../redux/slices/SeoKeywordSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllSeoKeywordDataQuery,
  useDeleteSeoKeywordByIdMutation,
} from "../../../services/SeoKeywordService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddSeoKeywordWrapper from "../Add/AddSeoKeywordWrapper";
import EditSeoKeywordWrapper from "../Edit/EditSeoKeywordWrapper";
import SeoKeywordListing from "./SeoKeywordListing";

const SeoKeywordListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteSeoKeyword] = useDeleteSeoKeywordByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedSeoKeywordId,
  } = useSelector((state: RootState) => state.seoKeyword);

  const columns: columnTypes[] = [
    {
      field: "categoryName",
      headerName: "Category",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "subCategoryName",
      headerName: "Subcategory",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "seoKeywords",
      headerName: "SEO Keywords",
      flex: "flex-[1_1_0%]",
    
    },
    {
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: SeoKeywordListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this SEO Keywords entry?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteSeoKeyword(row.id).then((res) => {
                  applyMutationToast(res);
                });
              }
            },
          });
        };

        const options = [
          {
            label: "View",
            onClick: () => navigate(`/seo-keywords/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedSeoKeywordId(row.id));
              dispatch(setSeoKeywordIsOpenEditDialog(true));
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

  const payload: SeoKeywordListPayload = useMemo(
    () => ({
      params: ["keyword"],
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

  const { data, isLoading, isFetching } = useGetAllSeoKeywordDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setSeoKeywordIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const seoKeywords = s.keyword
        const isActiveVal = s.isActive ?? s.is_active;
        return {
          id,
          categoryId: String(s.categoryId ?? s.category_id ?? ""),
          subcategoryId: String(s.subcategoryId ?? s.subcategory_id ?? ""),
          seoKeywords,
          categoryName: String(s.categoryName ?? s.category_name ?? ""),
          subCategoryName: String(s.subCategoryName ?? s.subcategory_name ?? ""),
          isActive:
            typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setSeoKeywordItems(mapped));
      dispatch(
        setSeoKeywordTotalItems(
          data?.totalItem ?? data?.total ?? source.length
        )
      );
    } else {
      dispatch(setSeoKeywordItems([]));
      dispatch(setSeoKeywordTotalItems(0));
    }
    dispatch(setSeoKeywordIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <SeoKeywordListing
        columns={columns}
        rows={items}
        onViewClick={(id) => navigate(`/seo-keywords/view/${id}`)}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setSeoKeywordPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setSeoKeywordRowsPerPage(newLimit)),
          setSearchValue: (value) =>
            dispatch(setSeoKeywordSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setSeoKeywordIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddSeoKeywordWrapper
          onClose={() => dispatch(setSeoKeywordIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedSeoKeywordId ? (
        <EditSeoKeywordWrapper
          selectedSeoKeywordId={selectedSeoKeywordId}
          onClose={() => {
            dispatch(setSeoKeywordIsOpenEditDialog(false));
            dispatch(setSelectedSeoKeywordId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default SeoKeywordListingWrapper;
