import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  SubscriptionPlanListItem,
  SubscriptionPlanListPayload,
} from "../../../models/SubscriptionPlan.model";
import {
  setSubscriptionPlanIsOpenAddDialog,
  setSubscriptionPlanIsOpenEditDialog,
  setSubscriptionPlanIsTableLoading,
  setSubscriptionPlanItems,
  setSubscriptionPlanPage,
  setSubscriptionPlanRowsPerPage,
  setSubscriptionPlanSearchValue,
  setSubscriptionPlanTotalItems,
  setSelectedSubscriptionPlanId,
} from "../../../redux/slices/SubscriptionPlanSlice";
import type { columnTypes } from "../../../components/UI/atoms/ATMTable/ATMTable";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";
import {
  useGetAllSubscriptionPlanDataQuery,
  useDeleteSubscriptionPlanByIdMutation,
} from "../../../services/SubscriptionPlanService";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import AddSubscriptionPlanWrapper from "../Add/AddSubscriptionPlanWrapper";
import EditSubscriptionPlanWrapper from "../Edit/EditSubscriptionPlanWrapper";
import SubscriptionListing from "./SubscriptionListing";
import { Tooltip } from "@mui/material";

const SubscriptionListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteSubscriptionPlan] = useDeleteSubscriptionPlanByIdMutation();
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    isOpenAddDialog,
    isOpenEditDialog,
    selectedSubscriptionPlanId,
  } = useSelector((state: RootState) => state.subscriptionPlan);

  const columns: columnTypes[] = [
    {
      field: "planName",
      headerName: "Plan Name",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "planPrice",
      headerName: "Price",
      flex: "flex-[1_1_0%]",
      renderCell: (row: SubscriptionPlanListItem) =>
        `₹${row.planPrice ?? 0}`,
    },
    {
      field: "credits",
      headerName: "Credits",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "planDuration",
      headerName: "Duration",
      flex: "flex-[1_1_0%]",
    },
    {
      field: "description",
      headerName: "Description",
      flex: "flex-[2_2_0%]",
      renderCell: (row: SubscriptionPlanListItem) => {
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
      renderCell: (row: SubscriptionPlanListItem) => {
        const handleDelete = () => {
          showConfirmationDialog({
            title: "Confirm Delete",
            text: "Are you sure you want to delete this Subscription Plan?",
            icon: "question",
            showCancelButton: true,
            next: (result) => {
              if (result?.isConfirmed) {
                deleteSubscriptionPlan(row.id).then((res) => {
                  applyMutationToast(res);
                });
              }
            },
          });
        };

        const options = [
          {
            label: "View",
            onClick: () => navigate(`/subscription/view/${row.id}`),
          },
          {
            label: "Edit",
            onClick: () => {
              dispatch(setSelectedSubscriptionPlanId(row.id));
              dispatch(setSubscriptionPlanIsOpenEditDialog(true));
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

  const payload: SubscriptionPlanListPayload = useMemo(
    () => ({
      params: ["planName"],
      searchValue,
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: {
        rangeFilterKey: "",
        rangeInitial: "",
        rangeEnd: "",
      },
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
    useGetAllSubscriptionPlanDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setSubscriptionPlanIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const mapped = source.map((s: Record<string, unknown>) => {
        const id = String(s.id ?? s._id ?? "");
        const price = s.planPrice ?? s.plan_price;
        const creditsVal = s.credits;
        return {
          id,
          planName: String(s.planName ?? s.plan_name ?? ""),
          description: String(s.description ?? ""),
          planPrice: typeof price === "number" ? price : Number(price) || 0,
          isActive: s.isActive,
          planDuration: String(
            s.planDuration ?? s.plan_duration ?? ""
          ),
          credits:
            typeof creditsVal === "number"
              ? creditsVal
              : Number(creditsVal) || 0,
        };
      });
      dispatch(setSubscriptionPlanItems(mapped));
      dispatch(
        setSubscriptionPlanTotalItems(
          data?.totalItem ?? data?.total ?? source.length
        )
      );
    } else {
      dispatch(setSubscriptionPlanItems([]));
      dispatch(setSubscriptionPlanTotalItems(0));
    }
    dispatch(setSubscriptionPlanIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  return (
    <>
      <SubscriptionListing
        columns={columns}
        rows={items}
        onViewClick={(id) => navigate(`/subscription/view/${id}`)}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setSubscriptionPlanPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setSubscriptionPlanRowsPerPage(newLimit)),
          setSearchValue: (value) =>
            dispatch(setSubscriptionPlanSearchValue(value)),
          setIsOpenAddDialog: (value) =>
            dispatch(setSubscriptionPlanIsOpenAddDialog(value)),
        }}
      />

      {isOpenAddDialog ? (
        <AddSubscriptionPlanWrapper
          onClose={() => dispatch(setSubscriptionPlanIsOpenAddDialog(false))}
        />
      ) : null}

      {isOpenEditDialog && selectedSubscriptionPlanId ? (
        <EditSubscriptionPlanWrapper
          selectedSubscriptionPlanId={selectedSubscriptionPlanId}
          onClose={() => {
            dispatch(setSubscriptionPlanIsOpenEditDialog(false));
            dispatch(setSelectedSubscriptionPlanId(""));
          }}
        />
      ) : null}
    </>
  );
};

export default SubscriptionListingWrapper;
