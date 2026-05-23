import ATMPageHeader from "src/components/UI/atoms/ATMPageHeader/ATMPageHeader";
import ATMTable from "src/components/UI/atoms/ATMTable/ATMTable";
import type { columnTypes } from "src/components/UI/atoms/ATMTable/ATMTable";
import ATMPagination from "src/components/UI/atoms/ATMPagination/ATMPagination";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import type { CreditConfigListItem } from "../../../models/CreditConfig.model";

type Props = {
  columns: columnTypes[];
  rows: CreditConfigListItem[];
  paginationProps: {
    isTableLoading: boolean;
    totalItems: number;
    page: number;
    rowsPerPage: number;
    searchValue: string;
    setPage: (newPage: number) => void;
    setRowsPerPage: (newLimit: number) => void;
    setSearchValue: (newValue: string) => void;
    setIsOpenAddDialog: (newValue: boolean) => void;
  };
};

const CreditConfigListing = ({
  columns,
  rows,
  paginationProps: {
    isTableLoading,
    totalItems,
    page,
    rowsPerPage,
    searchValue,
    setPage,
    setRowsPerPage,
    setSearchValue,
    setIsOpenAddDialog,
  },
}: Props) => {
  return (
    <SideNavLayout>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden py-1 px-2">
        <div className="sticky top-0 z-10 bg-white p-4 md:static">
          <ATMPageHeader
            moduleName="CREDIT CONFIG"
            pageTitle="Credit Config"
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            debounceMs={300}
            buttonProps={{
              btnName: "Add New",
              onClick: () => setIsOpenAddDialog(true),
            }}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col overscroll-contain">
          <ATMTable
            columns={columns}
            rows={rows}
            rowExtraClasses={() => "min-h-[40px]"}
            isLoading={isTableLoading}
            idKey="id"
            mobilePrimaryField="credit"
          />
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

export default CreditConfigListing;
