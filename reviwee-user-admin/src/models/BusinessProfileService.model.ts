export type CatalogStatus = "ACTIVE" | "INACTIVE";

export type BusinessProfileServiceItem = {
  id: string;
  businessId: string;
  serviceName: string;
  category: string;
  status: CatalogStatus;
  createdAt: string;
};

export type BusinessProfileServiceListPayload = {
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

export type AddBusinessProfileServicePayload = {
  businessId: string;
  services: string[];
};

export type EditBusinessProfileServicePayload = {
  businessId: string;
  serviceName: string;
};

