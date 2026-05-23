import ATMTable from "src/components/UI/atoms/ATMTable/ATMTable";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";

export type LedgerListItem = {
  id: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  isActive: boolean;
  [key: string]: unknown;
};

type Props = {
  columns: columnTypes[];
  rows: LedgerListItem[];
  paginationProps: {
    isLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
  };
};

const LedgerList = ({
  columns,
  rows,
  paginationProps: {
    isLoading,
    totalItems,
    page,
    rowsPerPage,
    setPage,
    setRowsPerPage,
  },
}: Props) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <ATMTable
          columns={columns}
          rows={rows}
          idKey="id"
          isLoading={isLoading}
          disableRowClick
        />
      </div>
      {totalItems > rowsPerPage && (
        <ATMPagination
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={setRowsPerPage}
          rowCount={totalItems}
          rows={rows}
        />
      )}
    </div>
  );
};

export default LedgerList;
