import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "src/redux/store";
import {
  setServiceItems,
  setServiceTotalItems,
  setServicesIsTableLoading,
  setServicePage,
  setServiceRowsPerPage,
  setServiceSearchValue,
  setServiceStatusFilter,
} from "src/redux/slices/BusinessProfileServicesSlice";
import type {
  BusinessProfileServiceItem,
  BusinessProfileServiceListPayload,
} from "src/models/BusinessProfileService.model";
import { useGetBusinessProfileByIdQuery } from "src/services/BusinessProfileService";
import {
  useAddBusinessServicesMutation,
  useChangeStatusServiceByIdMutation,
  useGetBusinessServicesByBusinessIdQuery,
  useUpdateBusinessServicesByIdMutation,
} from "src/services/BusinessProfileServicesService";
import {
  getApiMessage,
  showToast,
} from "src/utils/validations/showToaster";
import ServiceForm from "../Layouts/ServiceForm";
import ServicesListing from "./ServicesListing";

type CatalogFormMode = "none" | "add" | "edit";

const ServicesListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: businessIdParam } = useParams();
  const profileId = businessIdParam || "";
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);
  const [catalogFormMode, setCatalogFormMode] =
    useState<CatalogFormMode>("none");
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [addFormKey, setAddFormKey] = useState(0);
  const [changeServiceStatus] = useChangeStatusServiceByIdMutation();
  const [addBusinessServices] = useAddBusinessServicesMutation();
  const [updateBusinessServicesById] = useUpdateBusinessServicesByIdMutation();

  const { data } = useGetBusinessProfileByIdQuery(profileId, {
    skip: !profileId,
  });
  const businessId = data?.data?.businessId || "";

  const {
    items,
    totalItems,
    isTableLoading,
    page,
    rowsPerPage,
    searchValue,
    statusFilter,
  } = useSelector((state: RootState) => state.businessProfileServices);

  const listPayload: BusinessProfileServiceListPayload = useMemo(
    () => ({
      params: ["serviceName"],
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
      filterBy: [
        { fieldName: "businessId", value: businessId ? [businessId] : [] },
        ...(statusFilter !== "ALL"
          ? [{ fieldName: "status", value: [statusFilter] }]
          : []),
      ],
      isPaginationRequired: true,
    }),
    [businessId, page, rowsPerPage, searchValue, statusFilter]
  );

  const { data: servicesRes, isFetching: isServicesFetching } =
    useGetBusinessServicesByBusinessIdQuery(listPayload, {
      skip: !businessId,
    });

  useEffect(() => {
    dispatch(setServicesIsTableLoading(true));
    const apiItemsRaw = servicesRes?.data;
    if (Array.isArray(apiItemsRaw)) {
      const normalized = apiItemsRaw.map((s: Record<string, unknown>, idx: number) => ({
        id: String(s.id ?? s._id ?? `srv-${idx}`),
        businessId: String(s.businessId ?? businessId),
        serviceName: String(s.serviceName ?? s.name ?? ""),
        category: String(s.category ?? ""),
        status:
          (String(s.status ?? (s.isActive ? "ACTIVE" : "INACTIVE")) as
            | "ACTIVE"
            | "INACTIVE"),
        createdAt: String(s.createdAt ?? new Date().toISOString()),
      })) as BusinessProfileServiceItem[];
      dispatch(setServiceItems(normalized));
      dispatch(setServiceTotalItems(servicesRes?.totalItem ?? normalized.length));
    } else {
      dispatch(setServiceItems([]));
      dispatch(setServiceTotalItems(0));
    }
    dispatch(setServicesIsTableLoading(false));
  }, [
    businessId,
    dispatch,
    servicesRes,
  ]);

  const businessDisplayName = data?.data?.businessDisplayName;

  const handleServiceStatusToggle = async (serviceId: string) => {
    setStatusTogglingId(serviceId);
    try {
      const res = await changeServiceStatus(serviceId).unwrap();
      showToast("success", getApiMessage(res, "Service status updated"));
    } catch (e) {
      showToast("error", getApiMessage(e, "Failed to update service status"));
    } finally {
      setStatusTogglingId(null);
    }
  };

  const closeCatalogForm = () => {
    setCatalogFormMode("none");
    setEditingServiceId(null);
  };

  const editingRow = useMemo(
    () => items.find((s) => s.id === editingServiceId),
    [items, editingServiceId]
  );

  const editServiceInitialValues = useMemo(
    () => ({ serviceName: editingRow?.serviceName ?? "" }),
    [editingRow?.serviceName]
  );

  const serviceFormSlot =
    catalogFormMode === "add" ? (
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Add Service
        </h3>
        <ServiceForm
          key={`add-${addFormKey}`}
          initialValues={{ serviceName: "" }}
          submitLabel="Save Service"
          onCancel={closeCatalogForm}
          onSubmit={async (values) => {
            if (!businessId) {
              showToast("error", "BusinessId not found");
              return;
            }
            const res = await addBusinessServices({
              businessId,
              services: [values.serviceName],
            });
            if ("error" in res) {
              showToast("error", getApiMessage(res, "Failed to add service"));
              return;
            }
            showToast(
              "success",
              getApiMessage(res.data, "Service added successfully")
            );
            setAddFormKey((k) => k + 1);
          }}
        />
      </div>
    ) : catalogFormMode === "edit" && editingServiceId ? (
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Edit Service
        </h3>
        <ServiceForm
          key={`edit-${editingServiceId}`}
          initialValues={editServiceInitialValues}
          submitLabel="Update Service"
          onCancel={closeCatalogForm}
          onSubmit={async (values) => {
            if (!businessId) {
              showToast("error", "BusinessId not found");
              return;
            }
            const res = await updateBusinessServicesById({
              id: editingServiceId,
              body: {
                businessId,
                serviceName: values.serviceName,
              },
            });
            if ("error" in res) {
              showToast("error", getApiMessage(res, "Failed to update service"));
              return;
            }
            showToast(
              "success",
              getApiMessage(res.data, "Service updated successfully")
            );
            closeCatalogForm();
          }}
        />
      </div>
    ) : null;

  return (
    <ServicesListing
      topSlot={serviceFormSlot}
      businessDisplayName={businessDisplayName}
      rows={items}
      isLoading={isTableLoading || isServicesFetching}
      totalItems={totalItems}
      page={page}
      rowsPerPage={rowsPerPage}
      searchValue={searchValue}
      statusFilter={statusFilter}
      onSearchChange={(value: string) => dispatch(setServiceSearchValue(value))}
      onStatusFilterChange={(value: "ALL" | "ACTIVE" | "INACTIVE") =>
        dispatch(setServiceStatusFilter(value))
      }
      onPageChange={(newPage: number) => dispatch(setServicePage(newPage))}
      onRowsPerPageChange={(newLimit: number) =>
        dispatch(setServiceRowsPerPage(newLimit))
      }
      onAddClick={() => {
        setCatalogFormMode("add");
        setEditingServiceId(null);
      }}
      onEditClick={(row: BusinessProfileServiceItem) => {
        setCatalogFormMode("edit");
        setEditingServiceId(row.id);
      }}
      onStatusToggle={handleServiceStatusToggle}
      statusTogglingId={statusTogglingId}
    />
  );
};

export default ServicesListingWrapper;

