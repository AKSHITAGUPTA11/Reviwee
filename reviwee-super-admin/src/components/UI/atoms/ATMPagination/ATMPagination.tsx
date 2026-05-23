import Pagination from "@mui/material/Pagination";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

interface ATMPaginationPropTypes {
  page: number;
  onPageChange: (newPage: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange?: (newRowsPerPage: number) => void;
  rowCount: number;
  rowsPerPageOptions?: number[];
  rows: any[];
  hideRowsPerPage?: boolean;
}

const ATMPagination = ({
  rows,
  rowCount,
  page,
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 20, 50, 100],
}: ATMPaginationPropTypes) => {
  const totalPages = Math.ceil(rowCount / rowsPerPage);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages
        );
      } else {
        pages.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden md:block">
        {rows.length ? (
          <div className="flex flex-nowrap justify-between gap-3 px-2 min-h-[50px] py-2 items-center overflow-x-auto">
            {/* Rows Per Page */}
            <div className="flex flex-nowrap gap-3 items-center shrink-0 min-w-max">
              <span
                className="shrink-0 text-sm font-medium text-black"
                style={{ whiteSpace: "nowrap" }}
              >
                {["Rows", "\u00A0", "per", "\u00A0", "page", "\u00A0", ":"].join("")}
              </span>
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  onRowsPerPageChange?.(parseInt(e.target.value))
                }
                className="rounded-lg p-1 outline-0 bg-slate-100 text-sm font-medium text-black"
              >
                {rowsPerPageOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              {/* Showing Range */}
              <div className="whitespace-nowrap shrink-0 text-sm bg-slate-100 py-1 px-2 rounded-lg text-black font-medium">
                Showing {rowsPerPage * (page - 1) + 1} -{" "}
                {rowsPerPage * (page - 1) + rows.length} of {rowCount}
              </div>
            </div>

            {/* MUI Pagination */}
            <div>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_e, newPage) => onPageChange(newPage)}
                showFirstButton
                showLastButton
                size="medium"
                shape="rounded"
                variant="outlined"
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Mobile View */}
      <div className="md:hidden">
        {rows.length ? (
          <div className="w-full">
            <div className="flex gap-4">
              {/* Pagination Section */}
              <div className="flex items-center gap-1 justify-center bg-white shadow rounded-full px-6 py-2">
                {/* Left Arrow */}
                <button
                  onClick={() => onPageChange(Math.max(page - 1, 1))}
                  disabled={page === 1}
                  className="text-gray-600 disabled:opacity-30"
                >
                  <BiChevronLeft size={20} />
                </button>

                {/* Page Numbers */}
                {getPageNumbers().map((p, idx) => (
                  <button
                    key={idx}
                    disabled={p === "..."}
                    onClick={() => typeof p === "number" && onPageChange(p)}
                    className={`w-5 text-sm rounded-full flex items-center justify-center font-medium transition ${
                      p === page
                        ? "bg-slate-600 text-white"
                        : p === "..."
                        ? "text-gray-400 cursor-default"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}

                {/* Right Arrow */}
                <button
                  onClick={() => onPageChange(Math.min(page + 1, totalPages))}
                  disabled={page === totalPages}
                  className="text-gray-600 disabled:opacity-30"
                >
                  <BiChevronRight size={20} />
                </button>
              </div>

              {/* Rows Per Page */}
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-700 font-medium">Rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) =>
                    onRowsPerPageChange?.(parseInt(e.target.value))
                  }
                  className="rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-black"
                >
                  {rowsPerPageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
};

export default ATMPagination;
