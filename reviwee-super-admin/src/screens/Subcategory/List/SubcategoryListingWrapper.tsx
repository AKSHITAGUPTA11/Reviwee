import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  SubcategoryListItem,
  SubcategoryListPayload,
} from "../../../models/Subcategory.model";
import {
  setSubcategoryIsOpenAddDialog,
  setSubcategoryIsOpenEditDialog,
  setSubcategoryIsTableLoading,
  setSubcategoryItems,
  setSubcategoryPage,
  setSubcategoryRowsPerPage,
  setSubcategorySearchValue,
  setSubcategoryTotalItems,
  setSelectedSubcategoryId,
} from "../../../redux/slices/SubcategorySlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllSubcategoryDataQuery,
  useDeleteSubcategoryByIdMutation,
} from "../../../services/SubcategoryService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddSubcategoryWrapper from "../Add/AddSubcategoryWrapper";
import EditSubcategoryWrapper from "../Edit/EditSubcategoryWrapper";
import SubcategoryListing from "./SubcategoryListing";



const SubcategoryListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteSubcategory] = useDeleteSubcategoryByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedSubcategoryId,
  } = useSelector((state: RootState) => state.subcategory);

  const columns: columnTypes[] = [
    {
      field: "subCategoryName",
      headerName: "Subcategory Name",
      flex: "flex-[1_1_0%]",
    }, 
    {
      field: "categoryName",
      headerName: "Category name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "description",
      headerName: "Description",
      flex: "flex-[2_2_0%]",
      renderCell: (row: SubcategoryListItem) => {
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
      renderCell: (row: SubcategoryListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Subcategory?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteSubcategory(row.id).then((res) => {
                  applyMutationToast(res);
                });
              }
            },
          });
        };

        const options = [
          {
            label: "View",
            onClick: () =>
              navigate(`/subcategory/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedSubcategoryId(row.id));
              dispatch(setSubcategoryIsOpenEditDialog(true));
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

  const payload: SubcategoryListPayload = useMemo(
    () => ({
      params: ["subCategoryName"],
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

  const { data, isLoading, isFetching } =
    useGetAllSubcategoryDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setSubcategoryIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => ({
        id: String(s._id),
        subCategoryName: String(
          s.subCategoryName ?? s.subcategory_name ?? ""
        ),
        description: String(s.description ?? ""),
        categoryId: String(s.categoryId ?? s.category_id ?? ""),
        categoryName: String(s.categoryName ?? s.category_name ?? ""),
        isActive: true,
      }));
      dispatch(setSubcategoryItems(mapped));
      dispatch(
        setSubcategoryTotalItems(data?.totalItem ?? data?.total ?? source.length)
      );
    }
    dispatch(setSubcategoryIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <SubcategoryListing
        columns={columns}
        rows={items}
        onViewClick={(id) =>
          navigate(`//subcategory/view/${id}`)
        }
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setSubcategoryPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setSubcategoryRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setSubcategorySearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setSubcategoryIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddSubcategoryWrapper
          onClose={() => dispatch(setSubcategoryIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog ? (
        <EditSubcategoryWrapper
          selectedSubcategoryId={selectedSubcategoryId}
          onClose={() => {
            dispatch(setSubcategoryIsOpenEditDialog(false));
            dispatch(setSelectedSubcategoryId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default SubcategoryListingWrapper;
