export type CatalogStatus = "ACTIVE" | "INACTIVE";

export type BusinessProfileProductItem = {
  id: string;
  businessId: string;
  productName: string;
  category: string;
  status: CatalogStatus;
  createdAt: string;
};

export type BusinessProfileProductListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    dateFilterKey: string;
  };
  rangeFilterBy: {
    rangeFilterKey: string;
    rangeInitial: string;
    rangeEnd: string;
  };
  orderBy: string;
  orderByValue: 1 | -1;
  limit: number;
  page: number;
  filterBy: { fieldName: string; value: string[] }[];
  isPaginationRequired: boolean;
};

export type AddBusinessProfileProductPayload = {
  businessId: string;
  products: string[];
};

export type EditBusinessProfileProductPayload = {
  businessId: string;
  productName: string;
};

