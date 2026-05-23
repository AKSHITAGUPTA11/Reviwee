import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";
import type { AppDispatch, RootState } from "../../../redux/store";
import type {
  BusinessProfileListItem,
  BusinessProfileListPayload,
} from "../../../models/BusinessProfile.model";
import {
  setBusinessIsTableLoading,
  setBusinessItems,
  setBusinessPage,
  setBusinessRowsPerPage,
  setBusinessSearchValue,
  setBusinessTotalItems,
} from "../../../redux/slices/BusinessProfileSlice";
import {
  useDeleteBusinessProfileByIdMutation,
  useGetAllBusinessProfileDataQuery,
} from "../../../services/BusinessProfileService";
import { BASE_URL } from "../../../utils/constants";
import { showConfirmationDialog } from "../../../utils/validations/showConfirmationDialog";
import { showToast } from "../../../utils/validations/showToaster";
import BusinessProfileQRCodeDialog from "../QRCode/BusinessProfileQRCodeDialog";
import BusinessProfileListing from "./BusinessProfileListing";

const BusinessProfileListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [deleteBusinessProfile] = useDeleteBusinessProfileByIdMutation();
  const [isAddOptionsDialogOpen, setIsAddOptionsDialogOpen] = useState(false);
  const [qrDialog, setQrDialog] = useState<{
    open: boolean;
    businessId: string;
    businessDisplayName: string;
  }>({ open: false, businessId: "", businessDisplayName: "" });
  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
  } = useSelector((state: RootState) => state.businessProfile);

  const payload: BusinessProfileListPayload = useMemo(
    () => ({
      params: ["businessDisplayName"],
      searchValue,
      dateFilter: {
        startDate: "",
        endDate: "",
        dateFilterKey: "",
      },
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

  /**
   * `location.href` is always GET. Server route is POST → submit a form instead.
   * After Google OAuth, coming back to this app is configured on the backend (redirect URI / success URL).
   */
  const connectGoogleBusiness = () => {
    const base = String(BASE_URL ?? "")
      .trim()
      .replace(/\s+/g, "")
      .replace(/\/+$/, "");
    if (!base) return;

    const form = document.createElement("form");
    form.method = "GET";
    form.action = `${base}/google/auth/google`;

    document.body.appendChild(form);
    form.submit();
  };

  const { data, isLoading, isFetching } = useGetAllBusinessProfileDataQuery(payload);

  useEffect(() => {
    if (isLoading || isFetching) {
      dispatch(setBusinessIsTableLoading(true));
      return;
    }

    const source = data?.data || [];
    if (Array.isArray(source) && source.length > 0) {
      const normalizedItems = source.map((item: { _id?: string; id?: string }) => ({
        ...item,
        id: item.id ?? item._id,
      }));
      dispatch(setBusinessItems(normalizedItems));
      dispatch(setBusinessTotalItems(data?.totalItem || source.length));
    } else {
      dispatch(setBusinessItems([]));
      dispatch(setBusinessTotalItems(0));
    }
    dispatch(setBusinessIsTableLoading(false));
  }, [data, dispatch, isFetching, isLoading]);

  const handleViewClick = (id: string) => {
    if (!id) {
      showToast("error", "Business profile id not found.");
      return;
    }
    navigate(`/business-profile/view/${id}`);
  };

  const handleEditClick = (row: BusinessProfileListItem) => {
    const id = row.id ?? row._id ?? "";
    if (!id) {
      showToast("error", "Business profile id not found.");
      return;
    }
    navigate(`/business-profile/edit/${id}`);
  };

  const handleQRCodeClick = (row: BusinessProfileListItem) => {
    const bid = row.businessId ?? "";
    if (!bid) {
      showToast("error", "Business ID not found. Please try viewing the profile first.");
      return;
    }
    setQrDialog({
      open: true,
      businessId: bid,
      businessDisplayName: row.businessDisplayName ?? "Business",
    });
  };

  const handleDeleteClick = (row: BusinessProfileListItem) => {
    const id = row.id ?? row._id ?? "";
    if (!id) {
      showToast("error", "Business profile id not found.");
      return;
    }

    showConfirmationDialog({
      title: "Confirm Delete",
      text: "Are you sure you want to delete this Business Profile?",
      icon: "question",
      showCancelButton: true,
      next: (result) => {
        if (result?.isConfirmed) {
          deleteBusinessProfile(id).then((res) => {
            if (res.error) {
              const errData = res.error as { data?: { message?: string } };
              showToast("error", errData?.data?.message || "Failed to delete");
            } else {
              const resData = res.data as { message?: string };
              showToast("success", resData?.message || "Deleted successfully");
            }
          });
        }
      },
    });
  };

  return (
    <>
      <BusinessProfileListing
        rows={items}
        onViewClick={handleViewClick}
        onEditClick={handleEditClick}
        onQRCodeClick={handleQRCodeClick}
        onDeleteClick={handleDeleteClick}
        paginationProps={{
          isTableLoading,
          totalItems,
          page,
          rowsPerPage,
          searchValue,
          setPage: (newPage) => dispatch(setBusinessPage(newPage)),
          setRowsPerPage: (newLimit) =>
            dispatch(setBusinessRowsPerPage(newLimit)),
          setSearchValue: (value) => dispatch(setBusinessSearchValue(value)),
          onAddClick: () => setIsAddOptionsDialogOpen(true),
        }}
      />

      <Dialog
        open={isAddOptionsDialogOpen}
        onClose={() => setIsAddOptionsDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <div className="p-5">
          <h3 className="text-lg font-semibold text-slate-900">Add Business Profile</h3>
          <p className="mt-1 text-sm text-slate-600">
            Choose how you want to add this business.
          </p>
          <div className="mt-4 space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsAddOptionsDialogOpen(false);
                connectGoogleBusiness();
              }}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Connect Google Business
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddOptionsDialogOpen(false);
                navigate("/business-profile/add");
              }}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-left text-sm font-semibold text-white hover:opacity-95"
            >
              Create Manually
            </button>
          </div>
        </div>
      </Dialog>

      <BusinessProfileQRCodeDialog
        open={qrDialog.open}
        onClose={() => setQrDialog((p) => ({ ...p, open: false }))}
        businessId={qrDialog.businessId}
        businessDisplayName={qrDialog.businessDisplayName}
      />
    </>
  );
};

export default BusinessProfileListingWrapper;
