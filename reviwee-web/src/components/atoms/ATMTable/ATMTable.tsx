import React, { useState } from "react";

export type ColumnConfig<T> = {
  key: keyof T | string;
  header: string;
  render?: (value: T[keyof T] | null, row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  priority?: number;
  showInMobileCard?: boolean;
};

export type TableProps<T extends object> = {
  data: T[];
  columns: ColumnConfig<T>[];
  title?: string;
  emptyMessage?: string;
  rowClassName?: (row: T) => void;
  headerClassName?: string;
  onRowClick?: (row: T, index: number) => void;
  showMobileView?: boolean;
  actionColumn?: (row: T, index: number) => React.ReactNode;
  mobileCardTitle?: (row: T) => string;
  maxMobileCardHeight?: string;
  maxTableHeight?: string;
};

const ATMTable = <T extends object>({
  data = [],
  columns = [],
  title,
  emptyMessage = "No data available",
  rowClassName,
  headerClassName = "bg-secondary p-3 rounded-t-lg font-semibold text-white",
  onRowClick,
  showMobileView = true,
  actionColumn,
  mobileCardTitle,
  maxMobileCardHeight = "200px",
  maxTableHeight = "65vh",
}: TableProps<T>) => {
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const hasActionColumn = !!actionColumn;

  const renderValue = (value: unknown): React.ReactNode => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    return value as React.ReactNode;
  };

  const getPrimaryColumns = (): ColumnConfig<T>[] =>
    columns.filter((col) => col.priority === 1);

  const getSecondaryColumns = (): ColumnConfig<T>[] =>
    columns.filter(
      (col) => (col.priority && col.priority >= 2) || col.showInMobileCard
    );

  const toggleRowExpand = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index);
  };

  const renderPrimaryColumns = (row: T, rowIndex: number) => {
    const primaryColumns = getPrimaryColumns();
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {primaryColumns.map((column) => {
          const value =
            column.key in row ? row[column.key as keyof T] ?? null : null;
          return (
            <div
              key={`mobile-title-${rowIndex}-${column.key as string}`}
              className={`text-base font-semibold text-white ${
                column.className || ""
              }`}
            >
              {column.render
                ? column.render(value, row, rowIndex)
                : renderValue(value)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col relative ">
      {/* Fixed Title */}
      {title && (
        <div className="mb-2 md:sticky md:top-0 bg-transparent z-30">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
            {title}
          </h2>
        </div>
      )}

      {/* Desktop Table View */}
      <div
        className={`${
          showMobileView ? "hidden md:block" : "block"
        } bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden`}
      >
        {/* Header Row (sticky) */}
        <div
          className={`grid gap-2 md:gap-4 ${headerClassName} sticky top-0 z-20`}
          style={{
            gridTemplateColumns: `repeat(${
              columns.length + (hasActionColumn ? 1 : 0)
            }, minmax(0, 1fr))`,
          }}
        >
          {columns.map((column) => (
            <div
              key={String(column.key)}
              className={`text-[10px] sm:text-xs md:text-sm ${
                column.headerClassName || ""
              }`}
            >
              {column.header}
            </div>
          ))}
          {hasActionColumn && <div>Actions</div>}
        </div>

        {/* Scrollable Data Rows */}
        <div
          className="overflow-y-auto scrollbar-hide"
          style={{ maxHeight: maxTableHeight }}
        >
          <ul>
            {data.length > 0 ? (
              data.map((row, rowIndex) => (
                <li
                  key={rowIndex}
                  className={`grid gap-2 md:gap-4 items-center border-b border-gray-200 p-3 ${
                    rowClassName ? rowClassName(row) : ""
                  } ${onRowClick ? "cursor-pointer" : ""}`}
                  style={{
                    gridTemplateColumns: `repeat(${
                      columns.length + (hasActionColumn ? 1 : 0)
                    }, minmax(0, 1fr))`,
                  }}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map((column, i) => {
                    const value =
                      column.key in row
                        ? row[column.key as keyof T] ?? null
                        : null;
                    return (
                      <div
                        key={i}
                        className={`text-xs sm:text-sm ${
                          column.className || ""
                        }`}
                      >
                        {column.render
                          ? column.render(value, row, rowIndex)
                          : renderValue(value)}
                      </div>
                    );
                  })}
                  {hasActionColumn && (
                    <div
                      className="flex space-x-2 justify-start"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionColumn(row, rowIndex)}
                    </div>
                  )}
                </li>
              ))
            ) : (
              <li className="text-center py-8 text-white/60 text-sm sm:text-base">
                {emptyMessage}
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Mobile Card View (same as before) */}
      {showMobileView && (
        <div className="block md:hidden space-y-3">
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-2"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-2">
                  <div
                    className="flex-1 cursor-pointer pr-2"
                    onClick={() => toggleRowExpand(rowIndex)}
                  >
                    {mobileCardTitle ? (
                      <div className="font-semibold text-white text-base">
                        {mobileCardTitle(row)}
                      </div>
                    ) : (
                      renderPrimaryColumns(row, rowIndex)
                    )}
                  </div>

                  {hasActionColumn && (
                    <div
                      className="flex space-x-2 ml-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {actionColumn(row, rowIndex)}
                    </div>
                  )}
                </div>

                {/* Expandable Details */}
                {expandedRow === rowIndex && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div
                      className="space-y-2 overflow-y-auto scrollbar-hide"
                      style={{ maxHeight: maxMobileCardHeight }}
                    >
                      {getSecondaryColumns().map((column) => {
                        const value =
                          column.key in row
                            ? row[column.key as keyof T] ?? null
                            : null;
                        return (
                          <div
                            key={`detail-${rowIndex}-${column.key as string}`}
                            className="flex justify-between"
                          >
                            <span className="text-white/70 text-sm font-medium shrink-0 mr-2">
                              {column.header}:
                            </span>
                            <span
                              className={`text-sm text-white text-right break-words ${
                                column.className || ""
                              }`}
                            >
                              {column.render
                                ? column.render(value, row, rowIndex)
                                : renderValue(value)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Expand/Collapse Indicator */}
                <div
                  className="flex justify-center mt-2 pt-2 border-t border-white/20"
                  onClick={() => toggleRowExpand(rowIndex)}
                >
                  <span className="text-white/60 text-sm cursor-pointer">
                    {expandedRow === rowIndex
                      ? "Show Less \u02C4"
                      : "Show More \u02C5"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-white/60 text-sm">
              {emptyMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ATMTable;
