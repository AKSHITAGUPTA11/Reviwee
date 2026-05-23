import type { ReactNode } from "react";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import { useNavigate, useParams } from "react-router-dom";
import BusinessProfileViewTabs from "../../View/BusinessProfileViewTabs";
import type { CatalogStatus, BusinessProfileProductItem } from "src/models/BusinessProfileProduct.model";

type Props = {
  topSlot?: ReactNode;
  businessDisplayName?: string;
  rows: BusinessProfileProductItem[];
  isLoading: boolean;
  totalItems: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  statusFilter: "ALL" | CatalogStatus;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: "ALL" | CatalogStatus) => void;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newLimit: number) => void;
  onAddClick: () => void;
  onEditClick: (row: BusinessProfileProductItem) => void;
  onStatusToggle: (id: string) => void;
  statusTogglingId?: string | null;
};

const ProductsListing = ({
  topSlot,
  businessDisplayName,
  rows,
  isLoading,
  totalItems,
  page,
  rowsPerPage,
  searchValue,
  // statusFilter,
  onSearchChange,
  // onStatusFilterChange,
  onPageChange,
  onRowsPerPageChange,
  onAddClick,
  onEditClick,
  onStatusToggle,
  statusTogglingId = null,
}: Props) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6 min-h-[calc(100vh-140px)]">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              View Business Profile
            </h1>
            <button
              type="button"
              onClick={() => navigate("/business-profile")}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          <BusinessProfileViewTabs profileId={id} activeTab="products" />

          {topSlot}

          <div className="flex flex-1 flex-col min-h-0 overflow-hidden py-1 px-2">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Products</h2>
                {businessDisplayName ? (
                  <p className="text-sm text-slate-600">{businessDisplayName}</p>
                ) : null}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
                <input
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search product..."
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                />

                {/* <select
                  value={statusFilter}
                  onChange={(e) =>
                    onStatusFilterChange(e.target.value as "ALL" | CatalogStatus)
                  }
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-400"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select> */}

                <button
                  type="button"
                  onClick={onAddClick}
                  className="rounded-md bg-(--primary-main) px-4 py-2 text-sm font-semibold text-white hover:bg-(--primary-hover)"
                >
                  + Add Product
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
              {isLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                  Loading products...
                </div>
              ) : rows.length ? (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                        <th className="px-3 py-2">Product Name</th>
                        <th className="px-3 py-2">Status</th>
                        <th className="px-3 py-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows?.map((row) => (
                        <tr
                          key={row.id}
                          className="border-t border-slate-100 text-sm"
                        >
                          <td className="px-3 py-2 text-slate-800">
                            {row.productName}
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                role="switch"
                                aria-checked={row.status === "ACTIVE"}
                                aria-label={
                                  row.status === "ACTIVE"
                                    ? "Active — click to close"
                                    : "Closed — click to activate"
                                }
                                disabled={statusTogglingId === row.id}
                                onClick={() => onStatusToggle(row.id)}
                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-(--primary-main) ${
                                  row.status === "ACTIVE"
                                    ? "bg-emerald-500"
                                    : "bg-slate-300"
                                } ${
                                  statusTogglingId === row.id
                                    ? "cursor-wait opacity-60"
                                    : ""
                                }`}
                              >
                                <span
                                  className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                                    row.status === "ACTIVE"
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span
                                className={`text-xs font-medium ${
                                  row.status === "ACTIVE"
                                    ? "text-emerald-700"
                                    : "text-slate-600"
                                }`}
                              >
                                {row.status === "ACTIVE" ? "Active" : "Closed"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => onEditClick(row)}
                              className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex justify-center py-12 text-slate-500">
                  No Products Found
                </div>
              )}
            </div>

            <div className="p-4 py-2">
              <ATMPagination
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={onPageChange}
                onRowsPerPageChange={onRowsPerPageChange}
                rowCount={totalItems}
                rows={rows}
              />
            </div>
          </div>
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ProductsListing;

