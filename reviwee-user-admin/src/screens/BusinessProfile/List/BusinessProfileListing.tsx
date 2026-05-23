import ATMPageHeader from "src/components/UI/atoms/ATMPageHeader/ATMPageHeader";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import type { BusinessProfileListItem } from "../../../models/BusinessProfile.model";
import ATMMenu from "../../../components/UI/atoms/ATMMenu/ATMMenu";

type Props = {
  rows: BusinessProfileListItem[];
  onViewClick: (id: string) => void;
  onEditClick: (row: BusinessProfileListItem) => void;
  onQRCodeClick: (row: BusinessProfileListItem) => void;
  onDeleteClick: (row: BusinessProfileListItem) => void;
  paginationProps: {
    isTableLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    searchValue: string;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
    setSearchValue: (newValue: string) => void;
    onAddClick: () => void;
  };
};

const BusinessProfileListing = ({
  rows,
  onViewClick,
  onEditClick,
  onQRCodeClick,
  onDeleteClick,
  paginationProps: {
    isTableLoading,
    totalItems,
    page,
    rowsPerPage,
    searchValue,
    setPage,
    setRowsPerPage,
    setSearchValue,
    onAddClick,
  },
}: Props) => {
  const getBusinessId = (row: BusinessProfileListItem) =>
    row.id ?? row._id ?? "";

  return (
    <SideNavLayout>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden py-1 px-2">
        {/* Page Header */}
        <div className="sticky top-0 z-10 bg-white p-4 md:static">
          <ATMPageHeader
            moduleName="BUSINESS_PROFILE"
            pageTitle="Business Profile"
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            debounceMs={300}
            buttonProps={{
              btnName: "Add New",
              onClick: onAddClick,
            }}
          />
        </div>

        {/* Card Grid */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col overscroll-contain">
          <div className="p-4">
            {isTableLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="h-4 bg-slate-200 rounded w-2/3" />
                        <div className="mt-2 h-3 bg-slate-200 rounded w-4/5" />
                        <div className="mt-2 h-3 bg-slate-200 rounded w-2/3" />
                      </div>
                      <div className="h-9 w-9 bg-slate-200 rounded" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="h-16 bg-slate-200 rounded" />
                      <div className="h-16 bg-slate-200 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : rows?.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {rows.map((row) => {
                  const id = getBusinessId(row);
                  const ownerCount = Array.isArray(row.owner)
                    ? row.owner.length
                    : 0;
                  let staffCount = Array.isArray(row.staff)
                    ? row.staff.length
                    : 0;
                  if (
                    staffCount === 0 &&
                    Array.isArray(row.employees)
                  ) {
                    staffCount = row.employees.length;
                  }
                  const teamCount = ownerCount + staffCount;

                  return (
                    <article
                      key={id || row.businessDisplayName}
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        if (!id) return;
                        onViewClick(id);
                      }}
                      onKeyDown={(e) => {
                        if (!id) return;
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onViewClick(id);
                        }
                      }}
                      className={`group relative rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                        id ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-base font-semibold text-slate-900 truncate">
                              {row.businessDisplayName}
                            </h3>
                            <span
                              className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                row.isActive
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {row.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {row.categoryName ? (
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {row.categoryName}
                              </span>
                            ) : null}
                            {row.subCategoryName ? (
                              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                                {row.subCategoryName}
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div
                          className="shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ATMMenu
                            options={[
                              {
                                label: "View",
                                onClick: () => {
                                  if (!id) return;
                                  onViewClick(id);
                                },
                              },
                              {
                                label: "Edit",
                                onClick: () => onEditClick(row),
                              },
                              {
                                label: "QR Code",
                                onClick: () => onQRCodeClick(row),
                              },
                              {
                                label: "Delete",
                                onClick: () => onDeleteClick(row),
                              },
                            ]}
                            orientation="vertical"
                            triggerVariant="dots"
                          />
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3">
                        <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                            Team (owner + staff)
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-900">
                            {teamCount}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="flex justify-center py-12 text-slate-500">
                No Business Profiles Found
              </div>
            )}
          </div>
        </div>

        <div className="p-4 py-2">
          <ATMPagination
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={setPage}
            onRowsPerPageChange={setRowsPerPage}
            rowCount={totalItems}
            rows={rows}
          />
        </div>
      </div>
    </SideNavLayout>
  );
};

export default BusinessProfileListing;
