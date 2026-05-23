import ATMTable from "src/components/UI/atoms/ATMTable/ATMTable";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";
import type { ProfileViewModel } from "src/models/Customer.model";

type Props = {
  columns: columnTypes[];
  rows: ProfileViewModel[];
  profileDetails?: ProfileViewModel;
  onRowClick?: (row: ProfileViewModel) => void;
  paginationProps: {
    isTableLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
  };
};

const ProfileList = ({
  columns,
  rows,
  profileDetails,
  onRowClick,
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
      {profileDetails && (
        <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500">Remaining Credits</p>
            <p className="text-sm font-semibold text-slate-900">
              {profileDetails.remainingCredits ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Total Credits</p>
            <p className="text-sm font-semibold text-slate-900">
              {profileDetails.totalCredits ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Per Request Credit</p>
            <p className="text-sm font-semibold text-slate-900">
              {profileDetails.perRequestCredit ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Words Range</p>
            <p className="text-sm font-semibold text-slate-900">
              {`${profileDetails.minWords ?? 0} - ${profileDetails.maxWords ?? 0}`}
            </p>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <ATMTable
          columns={columns}
          rows={rows}
          idKey="id"
          isLoading={isTableLoading}
          disableRowClick={!onRowClick}
          onRowClick={onRowClick}
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

export default ProfileList;
