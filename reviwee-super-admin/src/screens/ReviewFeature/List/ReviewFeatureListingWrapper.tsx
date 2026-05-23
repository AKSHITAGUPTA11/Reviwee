import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  ReviewFeatureListItem,
  ReviewFeatureListPayload,
} from "../../../models/ReviewFeature.model";
import {
  setReviewFeatureIsOpenAddDialog,
  setReviewFeatureIsOpenEditDialog,
  setReviewFeatureIsTableLoading,
  setReviewFeatureItems,
  setReviewFeaturePage,
  setReviewFeatureRowsPerPage,
  setReviewFeatureSearchValue,
  setReviewFeatureTotalItems,
  setSelectedReviewFeatureId,
} from "../../../redux/slices/ReviewFeatureSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllReviewFeatureDataQuery,
  useDeleteReviewFeatureByIdMutation,
} from "../../../services/ReviewFeatureService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddReviewFeatureWrapper from "../Add/AddReviewFeatureWrapper";
import EditReviewFeatureWrapper from "../Edit/EditReviewFeatureWrapper";
import ReviewFeatureListing from "./ReviewFeatureListing";

const ReviewFeatureListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteReviewFeature] = useDeleteReviewFeatureByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedReviewFeatureId,
  } = useSelector((state: RootState) => state.reviewFeature);

  const columns: columnTypes[] = [
    {
      field: "featureName",
      headerName: "Feature",
      flex: "flex-[1_1_0%]",
    },
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
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: ReviewFeatureListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Review Feature?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteReviewFeature(row.id).then((res) => {
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
              navigate(`/review-feature/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedReviewFeatureId(row.id));
              dispatch(setReviewFeatureIsOpenEditDialog(true));
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

  const payload: ReviewFeatureListPayload = useMemo(
    () => ({
      params: ["featureName"],
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
    useGetAllReviewFeatureDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setReviewFeatureIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const isActiveVal = s.isActive ?? s.is_active;
        const featureName = String(
          s.featureName ?? s.feature_name ?? s.features ?? ""
        );
        return {
          id,
          categoryId: String(s.categoryId ?? s.category_id ?? ""),
          subcategoryId: String(s.subcategoryId ?? s.subcategory_id ?? ""),
          featureName,
          categoryName: String(s.categoryName ?? s.category_name ?? ""),
          subCategoryName: String(s.subCategoryName ?? s.subcategory_name ?? ""),
          isActive:
            typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setReviewFeatureItems(mapped));
      dispatch(
        setReviewFeatureTotalItems(
          data?.totalItem ?? data?.total ?? source.length
        )
      );
    } else {
      dispatch(setReviewFeatureItems([]));
      dispatch(setReviewFeatureTotalItems(0));
    }
    dispatch(setReviewFeatureIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <ReviewFeatureListing
        columns={columns}
        rows={items}
        onViewClick={(id) =>
          navigate(`/review-feature/view/${id}`)
        }
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setReviewFeaturePage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setReviewFeatureRowsPerPage(newLimit)),
          setSearchValue: (value) =>
            dispatch(setReviewFeatureSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setReviewFeatureIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddReviewFeatureWrapper
          onClose={() => dispatch(setReviewFeatureIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedReviewFeatureId ? (
        <EditReviewFeatureWrapper
          selectedReviewFeatureId={selectedReviewFeatureId}
          onClose={() => {
            dispatch(setReviewFeatureIsOpenEditDialog(false));
            dispatch(setSelectedReviewFeatureId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default ReviewFeatureListingWrapper;
