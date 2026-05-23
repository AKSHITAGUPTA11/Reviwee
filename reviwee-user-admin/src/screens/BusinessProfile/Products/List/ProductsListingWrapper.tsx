import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import type { AppDispatch, RootState } from "src/redux/store";
import {
  setProductItems,
  setProductTotalItems,
  setProductsIsTableLoading,
  setProductPage,
  setProductRowsPerPage,
  setProductSearchValue,
  setProductStatusFilter,
} from "src/redux/slices/BusinessProfileProductsSlice";
import type {
  BusinessProfileProductItem,
  BusinessProfileProductListPayload,
} from "src/models/BusinessProfileProduct.model";
import { useGetBusinessProfileByIdQuery } from "src/services/BusinessProfileService";
import {
  useAddBusinessProductsMutation,
  useChangeProductStatusByIdMutation,
  useGetBusinessProductsByBusinessIdQuery,
  useUpdateBusinessProductsByIdMutation,
} from "src/services/BusinessProfileProductsService";
import {
  getApiMessage,
  showToast,
} from "src/utils/validations/showToaster";
import ProductForm from "../Layouts/ProductForm";
import ProductsListing from "./ProductsListing";

type CatalogFormMode = "none" | "add" | "edit";

const ProductsListingWrapper = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { id: businessIdParam } = useParams();
  const profileId = businessIdParam || "";
  const [statusTogglingId, setStatusTogglingId] = useState<string | null>(null);
  const [catalogFormMode, setCatalogFormMode] =
    useState<CatalogFormMode>("none");
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [addFormKey, setAddFormKey] = useState(0);
  const [changeProductStatus] = useChangeProductStatusByIdMutation();
  const [addBusinessProducts] = useAddBusinessProductsMutation();
  const [updateBusinessProductsById] = useUpdateBusinessProductsByIdMutation();

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
  } = useSelector((state: RootState) => state.businessProfileProducts);

  const listPayload: BusinessProfileProductListPayload = useMemo(
    () => ({
      params: ["productName"],
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

  const { data: productsRes, isFetching: isProductsFetching } =
    useGetBusinessProductsByBusinessIdQuery(listPayload, {
      skip: !businessId,
    });

  useEffect(() => {
    dispatch(setProductsIsTableLoading(true));
    const apiItemsRaw = productsRes?.data;
    if (Array.isArray(apiItemsRaw)) {
      const normalized = apiItemsRaw.map((p: Record<string, unknown>, idx: number) => ({
        id: String(p.id ?? p._id ?? `prd-${idx}`),
        businessId: String(p.businessId ?? businessId),
        productName: String(p.productName ?? p.name ?? ""),
        category: String(p.category ?? ""),
        status:
          (String(p.status ?? (p.isActive ? "ACTIVE" : "INACTIVE")) as
            | "ACTIVE"
            | "INACTIVE"),
        createdAt: String(p.createdAt ?? new Date().toISOString()),
      })) as BusinessProfileProductItem[];
      dispatch(setProductItems(normalized));
      dispatch(setProductTotalItems(productsRes?.totalItem ?? normalized.length));
    } else {
      dispatch(setProductItems([]));
      dispatch(setProductTotalItems(0));
    }
    dispatch(setProductsIsTableLoading(false));
  }, [
    businessId,
    dispatch,
    productsRes,
  ]);

  const businessDisplayName = data?.data?.businessDisplayName;

  const handleProductStatusToggle = async (productId: string) => {
    setStatusTogglingId(productId);
    try {
      const res = await changeProductStatus(productId).unwrap();
      showToast("success", getApiMessage(res, "Product status updated"));
    } catch (e) {
      showToast("error", getApiMessage(e, "Failed to update product status"));
    } finally {
      setStatusTogglingId(null);
    }
  };

  const closeCatalogForm = () => {
    setCatalogFormMode("none");
    setEditingProductId(null);
  };

  const editingRow = useMemo(
    () => items.find((p) => p.id === editingProductId),
    [items, editingProductId]
  );

  const editProductInitialValues = useMemo(
    () => ({ productName: editingRow?.productName ?? "" }),
    [editingRow?.productName]
  );

  const productFormSlot =
    catalogFormMode === "add" ? (
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Add Product
        </h3>
        <ProductForm
          key={`add-${addFormKey}`}
          initialValues={{ productName: "" }}
          submitLabel="Save Product"
          onCancel={closeCatalogForm}
          onSubmit={async (values) => {
            if (!businessId) {
              showToast("error", "BusinessId not found");
              return;
            }
            const res = await addBusinessProducts({
              businessId,
              products: [values.productName],
            });
            if ("error" in res) {
              showToast("error", getApiMessage(res, "Failed to add product"));
              return;
            }
            showToast(
              "success",
              getApiMessage(res.data, "Product added successfully")
            );
            setAddFormKey((k) => k + 1);
          }}
        />
      </div>
    ) : catalogFormMode === "edit" && editingProductId ? (
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">
          Edit Product
        </h3>
        <ProductForm
          key={`edit-${editingProductId}`}
          initialValues={editProductInitialValues}
          submitLabel="Update Product"
          onCancel={closeCatalogForm}
          onSubmit={async (values) => {
            if (!businessId) {
              showToast("error", "BusinessId not found");
              return;
            }
            const res = await updateBusinessProductsById({
              id: editingProductId,
              body: {
                businessId,
                productName: values.productName,
              },
            });
            if ("error" in res) {
              showToast("error", getApiMessage(res, "Failed to update product"));
              return;
            }
            showToast(
              "success",
              getApiMessage(res.data, "Product updated successfully")
            );
            closeCatalogForm();
          }}
        />
      </div>
    ) : null;

  return (
    <ProductsListing
      topSlot={productFormSlot}
      businessDisplayName={businessDisplayName}
      rows={items}
      isLoading={isTableLoading || isProductsFetching}
      totalItems={totalItems}
      page={page}
      rowsPerPage={rowsPerPage}
      searchValue={searchValue}
      statusFilter={statusFilter}
      onSearchChange={(value) => dispatch(setProductSearchValue(value))}
      onStatusFilterChange={(value) => dispatch(setProductStatusFilter(value))}
      onPageChange={(newPage) => dispatch(setProductPage(newPage))}
      onRowsPerPageChange={(newLimit) =>
        dispatch(setProductRowsPerPage(newLimit))
      }
      onAddClick={() => {
        setCatalogFormMode("add");
        setEditingProductId(null);
      }}
      onEditClick={(row: BusinessProfileProductItem) => {
        setCatalogFormMode("edit");
        setEditingProductId(row.id);
      }}
      onStatusToggle={handleProductStatusToggle}
      statusTogglingId={statusTogglingId}
    />
  );
};

export default ProductsListingWrapper;

