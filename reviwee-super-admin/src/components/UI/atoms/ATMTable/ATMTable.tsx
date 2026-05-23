import React from "react";
import { useMediaQuery } from "@mui/material";
import { twMerge } from "tailwind-merge";

export interface columnTypes {
  field: string;
  headerName: string;
  flex?: string;
  renderCell?: (row: any) => string | React.ReactNode;
  align?: "start" | "center" | "end";
  extraClasses?: string;
  hidden?: boolean;
  noAuthRequired?: boolean;
  noTruncate?: boolean;
  // accessAction? : string;
}

const getGridColumnSize = (column: columnTypes): string => {
  if (column.noTruncate) return "minmax(180px, max-content)";
  const flex = column.flex || "";
  const pxMatch = flex.match(/flex-\[\s*0\s*_+\s*0\s*_+\s*(\d+(?:\.\d+)?)px\s*\]/);
  if (pxMatch) return `${pxMatch[1]}px`;
  const frMatch = flex.match(/flex-\[(\d+(?:\.\d+)?)/);
  if (frMatch) return `${frMatch[1]}fr`;
  return "1fr";
};
interface ATMTablePropTypes<T> {
  columns: columnTypes[];
  rows: T[];
  isCheckbox?: boolean;
  selectedRows?: T[];
  onRowSelect?: (row: any) => void;
  extraClasses?: string;
  onRowClick?: (row: any) => void;
  rowExtraClasses?: (row: any) => void;
  isLoading?: boolean;
  idKey?: string;
  noDataMessage?: React.ReactNode;
  disableRowClick?: boolean;
  mobilePrimaryField?: string;
  mobileSecondaryField?: string;
  mobilePrimaryRender?: (row: any) => React.ReactNode;
  mobileSecondaryRender?: (row: any) => React.ReactNode;
}

const isActionColumn = (col: columnTypes) =>
  col.field === "action" || col.headerName === "Actions";

const ATMTable = <T extends {}>({
  columns,
  rows,
  selectedRows = [],
  onRowSelect,
  isCheckbox = false,
  extraClasses = "",
  onRowClick,
  rowExtraClasses,
  isLoading = false,
  idKey = "_id",
  noDataMessage = "No Data Found",
  disableRowClick = false,
  mobilePrimaryField,
  mobileSecondaryField,
  mobilePrimaryRender,
  mobileSecondaryRender,
}: ATMTablePropTypes<T>) => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const visibleColumns = columns.filter((c) => !c.hidden);
  const nonActionColumns = visibleColumns.filter((c) => !isActionColumn(c));
  const actionColumn = visibleColumns.find((c) => isActionColumn(c));
  const primaryColumn = mobilePrimaryField
    ? visibleColumns.find((c) => c.field === mobilePrimaryField)
    : nonActionColumns[0];
  const secondaryColumn = mobileSecondaryField
    ? visibleColumns.find((c) => c.field === mobileSecondaryField)
    : nonActionColumns[1];
  const gridTemplateColumns = [
    ...(isCheckbox && (rows?.length || isLoading) ? ["20px"] : []),
    ...visibleColumns.map(getGridColumnSize),
  ].join(" ");

  // Mobile card view - h-full min-h-0 so parent scroll area works; overflow-y-auto as fallback
  if (isMobile) {
    return (
      <div
        className={twMerge("w-full h-full min-h-0 border-0 rounded overflow-y-auto overflow-x-hidden", extraClasses)}
        style={{ WebkitOverflowScrolling: "touch" } as React.CSSProperties}
      >
        {isLoading ? (
          Array(10)
            .fill(0)
            .map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 px-4 animate-pulse"
              >
                <div className="flex-1 min-w-0">
                  <div className="bg-slate-200 h-4 rounded w-3/4 mb-2" />
                  <div className="bg-slate-200 h-3 rounded w-1/2" />
                </div>
                {actionColumn && (
                  <div className="shrink-0 ml-2">
                    <div className="bg-slate-200 h-6 w-6 rounded" />
                  </div>
                )}
              </div>
            ))
        ) : rows?.length ? (
          rows.map((row: any, rowIndex) => (
            <div
              key={row[idKey] || rowIndex}
              className={`flex items-center justify-between py-3 px-4 ${row?.isActive ? "bg-white hover:bg-slate-200" : "bg-slate-300"} ${!disableRowClick && onRowClick && "cursor-pointer"} ${rowExtraClasses?.(row) || ""}`}
              onClick={() => !disableRowClick && onRowClick?.(row)}
            >
              <div className="flex-1 min-w-0 pr-2">
                {(mobilePrimaryRender || primaryColumn) && (
                  <div className="text-sm font-medium text-black truncate">
                    {mobilePrimaryRender
                      ? mobilePrimaryRender(row)
                      : primaryColumn?.renderCell
                        ? primaryColumn.renderCell(row)
                        : primaryColumn && row[primaryColumn.field]}
                  </div>
                )}
                {(mobileSecondaryRender || (secondaryColumn && primaryColumn?.field !== secondaryColumn?.field)) && (
                  <div className="text-xs text-neutral mt-0.5 truncate">
                    {mobileSecondaryRender
                      ? mobileSecondaryRender(row)
                      : secondaryColumn?.renderCell
                        ? secondaryColumn.renderCell(row)
                        : secondaryColumn && row[secondaryColumn.field]}
                  </div>
                )}
              </div>
              {actionColumn?.renderCell && (
                <div
                  className="shrink-0 flex items-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  {actionColumn.renderCell(row)}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="flex justify-center py-5 text-slate-500">
            {noDataMessage}
          </div>
        )}
      </div>
    );
  }

  // Desktop grid view
  return (
    <div className="w-full overflow-x-auto">
      <div
        className={twMerge(
          `min-w-[900px] relative border-0 rounded ${extraClasses}`
        )}
        style={{
          display: "grid",
          gridTemplateColumns,
        }}
      >
        {/* Header row */}
        {isCheckbox && (rows?.length || isLoading) && (
          <div className="sticky top-0 z-10 min-h-[40px] py-3 px-2 border-b border-slate-300 bg-surface-medium rounded-tl flex items-center">
            <input
              type="checkbox"
              className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300"
              checked={selectedRows?.length === rows?.length}
              onChange={(e) => {
                e.stopPropagation();
                selectedRows?.length === rows?.length
                  ? onRowSelect && onRowSelect([])
                  : onRowSelect && onRowSelect(rows);
              }}
            />
          </div>
        )}
        {visibleColumns.map((column, colIndex) => (
          <div
            key={column.field}
            className={`sticky top-0 z-10 min-h-[40px] text-body-1 font-medium uppercase text-neutral py-3 px-2 flex items-center justify-${column.align || "start"} border-b border-slate-300 bg-surface-medium ${column.extraClasses} ${colIndex === 0 && (!isCheckbox || !rows?.length) ? "rounded-tl" : ""} ${colIndex === visibleColumns.length - 1 ? "rounded-tr" : ""}`}
          >
            {column.headerName}
          </div>
        ))}

        {/* Body */}
        {isLoading ? (
          Array(10)
            .fill(0)
            .map((_, index) => (
              <React.Fragment key={index}>
                {isCheckbox && (
                  <div className="animate-pulse min-h-[44px] py-2.5 px-2">
                    <div className="bg-slate-200 h-full rounded" />
                  </div>
                )}
                {visibleColumns.map((column) => (
                  <div
                    key={column.field}
                    className="animate-pulse min-h-[44px] py-2.5 px-2"
                  >
                    <div className="bg-slate-200 h-full rounded" />
                  </div>
                ))}
              </React.Fragment>
            ))
        ) : rows?.length ? (
          rows?.map((row: any, rowIndex) => (
            <React.Fragment key={row[idKey] || rowIndex}>
              {isCheckbox && (
                <div
                  className={`flex items-center px-2 py-2.5 ${row?.isActive ? "bg-white hover:bg-slate-200" : "bg-slate-300"} ${rowIndex === rows?.length - 1 && "rounded-bl"}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.findIndex(
                        (ele: any) => ele._id === row._id
                      ) !== -1
                    }
                    onChange={(e) => {
                      e.stopPropagation();
                      onRowSelect &&
                        onRowSelect((selectedRows: any) =>
                          selectedRows.findIndex(
                            (ele: any) => ele._id === row._id
                          ) === -1
                            ? [...selectedRows, row]
                            : selectedRows.filter(
                                (selectedRow: any) =>
                                  selectedRow._id !== row._id
                              )
                        );
                    }}
                    className="w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300"
                  />
                </div>
              )}
              {visibleColumns.map((column, colIndex) => (
                <div
                  key={column.field}
                  onClick={() => !disableRowClick && onRowClick?.(row)}
                  className={`text-sm py-2.5 ${column.noTruncate ? "overflow-visible" : "overflow-hidden text-ellipsis"} text-black px-2 flex items-center justify-${column.align || "start"} ${row?.isActive ? "bg-white hover:bg-slate-200" : "bg-slate-300"} ${rowIndex === rows?.length - 1 && colIndex === 0 && !isCheckbox ? "rounded-bl" : ""} ${rowIndex === rows?.length - 1 && colIndex === visibleColumns.length - 1 ? "rounded-br" : ""} ${!disableRowClick && onRowClick && "cursor-pointer"} ${rowExtraClasses?.(row) || ""} ${column.extraClasses}`}
                >
                  {column.renderCell
                    ? column.renderCell(row)
                    : row[column.field]}
                </div>
              ))}
            </React.Fragment>
          ))
        ) : (
          <div
            className="flex justify-center py-5 text-slate-500"
            style={{ gridColumn: "1 / -1" }}
          >
            {noDataMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATMTable;
