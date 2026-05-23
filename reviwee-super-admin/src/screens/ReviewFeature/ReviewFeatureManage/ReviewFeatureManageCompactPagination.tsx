import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

type Props = {
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (p: number) => void;
};

/**
 * Single-line pager: always shows prev/next + page/total (disabled when only one page).
 */
const ReviewFeatureManageCompactPagination = ({
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
}: Props) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage) || 1);
  const start = totalItems === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-xs text-slate-600 border-b border-slate-100 bg-slate-50/90">
      <span className="tabular-nums shrink-0">
        {start}–{end} of {totalItems}
      </span>
      <div className="flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 1}
          className="p-1 rounded border border-transparent hover:bg-slate-200 hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          onClick={() => onPageChange(page - 1)}
        >
          <BiChevronLeft className="text-lg text-slate-700" />
        </button>
        <span className="tabular-nums px-1 min-w-[3rem] text-center text-slate-700 font-medium">
          {page}/{totalPages}
        </span>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= totalPages}
          className="p-1 rounded border border-transparent hover:bg-slate-200 hover:border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
          onClick={() => onPageChange(page + 1)}
        >
          <BiChevronRight className="text-lg text-slate-700" />
        </button>
      </div>
    </div>
  );
};

export default ReviewFeatureManageCompactPagination;
