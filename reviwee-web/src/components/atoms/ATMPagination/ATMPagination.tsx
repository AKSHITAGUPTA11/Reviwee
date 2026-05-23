import React, { useState, useEffect } from "react";

type ATMPaginationProps = {
  totalItems: number;
  pageSizeOptions?: number[]; 
  initialPageSize?: number;
  initialPage?: number;
  onPageChange?: (page: number, pageSize: number) => void;
};

const ATMPagination: React.FC<ATMPaginationProps> = ({
  totalItems,
  pageSizeOptions = [10, 20, 50],
  initialPageSize = 10,
  initialPage = 1,
  onPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = Math.ceil(totalItems / pageSize);

  useEffect(() => {
    onPageChange?.(currentPage, pageSize);
  }, [currentPage, pageSize, onPageChange]);

  const handlePageClick = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); 
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between mt-4 gap-3 text-white">
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span>Show</span>
        <select
          className="bg-secondary  text-white px-2 py-1 rounded"
          value={pageSize}
          onChange={handlePageSizeChange}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>

      {/* ATMPagination buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          className="px-3 py-1 rounded bg-secondary/80 disabled:opacity-50"
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &lt;
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            className={`px-3 py-1 rounded ${
              page === currentPage ? "bg-secondary text-white font-semibold" : "border border-secondary"
            }`}
            onClick={() => handlePageClick(page)}
          >
            {page}
          </button>
        ))}

        <button
          className="px-3 py-1 rounded bg-secondary/80 disabled:opacity-50"
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default ATMPagination;

