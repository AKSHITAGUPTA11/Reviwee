import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  CategoryListItem,
  CategoryListPayload,
} from "../../../models/Category.model";
import {
  setCategoryIsOpenAddDialog,
  setCategoryIsOpenEditDialog,
  setCategoryIsTableLoading,
  setCategoryItems,
  setCategoryPage,
  setCategoryRowsPerPage,
  setCategorySearchValue,
  setCategoryTotalItems,
  setSelectedCategoryId,
} from "../../../redux/slices/CategorySlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllCategoryDataQuery,
  useDeleteCategoryByIdMutation,
} from "../../../services/CategoryService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddCategoryWrapper from "../Add/AddCategoryWrapper";
import EditCategoryWrapper from "../Edit/EditCategoryWrapper";
import CategoryListing from "./CategoryListing";



const CategoryListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteCategory] = useDeleteCategoryByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedCategoryId,
  } = useSelector((state: RootState) => state.category);

  const columns: columnTypes[] = [
    { field: "categoryName", headerName: "Category Name", flex: "flex-[1_1_0%]" },
    {
      field: "description",
      headerName: "Description",
      flex: "flex-[2_2_0%]",
      renderCell: (row: CategoryListItem) => {
        const desc = row.description || "";
        return (
          <Tooltip title={desc} placement="top">
            <div className="line-clamp-2 cursor-default w-full">
              {desc}
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: CategoryListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Category?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteCategory(row.id).then((res) => {
                  applyMutationToast(res);
                });
              }
            },
          });
        };

        const options = [
          {
            label: "View",
            onClick: () => navigate(`/category/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedCategoryId(row.id));
              dispatch(setCategoryIsOpenEditDialog(true));
            },
          },
          { label: "Delete", onClick: handleDelete },
        ];

        return (
          <div onClick={(e) => e.stopPropagation()}>
            <ATMMenu options={options} orientation="vertical" triggerVariant="dots" />
          </div>
        );
      },
    },
  ];

  const payload: CategoryListPayload = useMemo(
    () => ({
      params: ["categoryName"],
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

  const { data, isLoading, isFetching } = useGetAllCategoryDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setCategoryIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const isActiveVal = s.isActive ?? s.is_active;
        return {
          id,
          categoryName: String(s.categoryName ?? s.category_name ?? ""),
          description: String(s.description ?? ""),
          isActive: typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setCategoryItems(mapped));
      dispatch(setCategoryTotalItems(data?.totalItem ?? data?.total ?? source.length));
    } else {
      dispatch(setCategoryItems([]));
      dispatch(setCategoryTotalItems(0));
    }
    dispatch(setCategoryIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <CategoryListing
        columns={columns}
        rows={items}
        onViewClick={(id) => navigate(`/category/view/${id}`)}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setCategoryPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setCategoryRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setCategorySearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setCategoryIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddCategoryWrapper
          onClose={() => dispatch(setCategoryIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedCategoryId ? (
        <EditCategoryWrapper
          selectedCategoryId={selectedCategoryId}
          onClose={() => {
            dispatch(setCategoryIsOpenEditDialog(false));
            dispatch(setSelectedCategoryId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default CategoryListingWrapper;
