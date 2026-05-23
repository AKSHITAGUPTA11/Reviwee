import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  ReviewFeatureOptionListItem,
  ReviewFeatureOptionListPayload,
} from "../../../models/ReviewFeatureOption.model";
import {
  setReviewFeatureOptionIsOpenAddDialog,
  setReviewFeatureOptionIsOpenEditDialog,
  setReviewFeatureOptionIsTableLoading,
  setReviewFeatureOptionItems,
  setReviewFeatureOptionPage,
  setReviewFeatureOptionRowsPerPage,
  setReviewFeatureOptionSearchValue,
  setReviewFeatureOptionTotalItems,
  setSelectedReviewFeatureOptionId,
} from "../../../redux/slices/ReviewFeatureOptionSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllReviewFeatureOptionDataQuery,
  useDeleteReviewFeatureOptionByIdMutation,
} from "../../../services/ReviewFeatureOptionService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddReviewFeatureOptionWrapper from "../Add/AddReviewFeatureOptionWrapper";
import EditReviewFeatureOptionWrapper from "../Edit/EditReviewFeatureOptionWrapper";
import ReviewFeatureOptionListing from "./ReviewFeatureOptionListing";
import { Tooltip } from "@mui/material";

const ReviewFeatureOptionListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteReviewFeatureOption] = useDeleteReviewFeatureOptionByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedReviewFeatureOptionId,
  } = useSelector((state: RootState) => state.reviewFeatureOption);

  const columns: columnTypes[] = [
    {
      field: "reviewFeatureName",
      headerName: "Feature Name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "categoryName",
      headerName: "Category Name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "subCategoryName",
      headerName: "Subcategory Name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "featureOption",
      headerName: "Options",
      flex: "flex-[2_2_0%]",
      renderCell: (row: ReviewFeatureOptionListItem  ) => {
        const ops = row.featureOption || "";
        return (
          <Tooltip title={ops} placement="top">
            <div className="line-clamp-2 cursor-default w-full">
              {ops}
            </div>
          </Tooltip>
        );
      },
    },
    {
      field: "language",
      headerName: "Language",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "action",
      headerName: "Actions",
      flex: "flex-[1_1_0%]",
      align: "center",
      renderCell: (row: ReviewFeatureOptionListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Review Feature Option?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteReviewFeatureOption(row.id).then((res) => {
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
              navigate(`/review-feature-option/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedReviewFeatureOptionId(row.id));
              dispatch(setReviewFeatureOptionIsOpenEditDialog(true));
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

  const payload: ReviewFeatureOptionListPayload = useMemo(
    () => ({
      params: ["featureOption"],
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
    useGetAllReviewFeatureOptionDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setReviewFeatureOptionIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const isActiveVal = s.isActive ?? s.is_active;
        return {
          id,
          reviewFeatureId: String(s.reviewFeatureId ?? s.review_feature_id ?? ""),
          reviewFeatureName: String(
            s.reviewFeatureName ??
              s.review_feature_name ??
              s.featureName ??
              s.feature_name ??
              ""
          ),
          categoryName: String(
            s.categoryName ?? s.category_name ?? ""
          ),
          subCategoryName: String(
            s.subCategoryName ??
              s.subcategoryName ??
              s.subcategory_name ??
              s.subCategory_name ??
              ""
          ),
          featureOption: String(s.featureOption ?? s.feature_option ?? ""),
          language: String(s.language ?? ""),
          isActive:
            typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
        };
      });
      dispatch(setReviewFeatureOptionItems(mapped));
      dispatch(
        setReviewFeatureOptionTotalItems(
          data?.totalItem ?? data?.total ?? source.length
        )
      );
    } else {
      dispatch(setReviewFeatureOptionItems([]));
      dispatch(setReviewFeatureOptionTotalItems(0));
    }
    dispatch(setReviewFeatureOptionIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <ReviewFeatureOptionListing
        columns={columns}
        rows={items}
        onViewClick={(id) =>
          navigate(`/review-feature-option/view/${id}`)
        }
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setReviewFeatureOptionPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setReviewFeatureOptionRowsPerPage(newLimit)),
          setSearchValue: (value) =>
            dispatch(setReviewFeatureOptionSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setReviewFeatureOptionIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddReviewFeatureOptionWrapper
          onClose={() => dispatch(setReviewFeatureOptionIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedReviewFeatureOptionId ? (
        <EditReviewFeatureOptionWrapper
          selectedReviewFeatureOptionId={selectedReviewFeatureOptionId}
          onClose={() => {
            dispatch(setReviewFeatureOptionIsOpenEditDialog(false));
            dispatch(setSelectedReviewFeatureOptionId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default ReviewFeatureOptionListingWrapper;
