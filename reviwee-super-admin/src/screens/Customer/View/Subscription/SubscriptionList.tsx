import ATMTable from "src/components/UI/atoms/ATMTable/ATMTable";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";

export type SubscriptionListItem = {
  id: string;
  planName: string;
  planPrice: string;
  amtAfterDiscount: number;
  planStartDate: string;
  planExpiryDate: string;
  planStatus: string;
  paymentStatus: string;
  receivedAmt: number;
  dueAmt: number;
  isActive: boolean;
  [key: string]: unknown;
};

type Props = {
  columns: columnTypes[];
  rows: SubscriptionListItem[];
  paginationProps: {
    isTableLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
  };
};

const SubscriptionList = ({
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

export default SubscriptionList;
