import ATMTable from "src/components/UI/atoms/ATMTable/ATMTable";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";

export type CreditLedgerListItem = {
  id: string;
  createdAt: string;
  previousCredits: number;
  deductedCredits: number;
  remainingCredits: number;
  actionType: string;
  reviewText: string;
  description: string;
  isActive: boolean;
  [key: string]: unknown;
};

type Props = {
  columns: columnTypes[];
  rows: CreditLedgerListItem[];
  paginationProps: {
    isTableLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
  };
};

const CreditLedgerList = ({
  columns,
  rows,
  paginationProps: {
    isTableLoading,
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
          isLoading={isTableLoading}
          disableRowClick
        />
      </div>
      <ATMPagination
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={setPage}
        onRowsPerPageChange={setRowsPerPage}
        rowCount={totalItems}
        rows={rows}
      />
    </div>
  );
};

export default CreditLedgerList;
