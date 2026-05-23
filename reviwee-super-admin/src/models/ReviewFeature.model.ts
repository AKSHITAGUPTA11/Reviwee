export type ReviewFeatureListItem = {
  id: string;
  categoryId: string;
  subcategoryId: string;
  featureName: string;
  categoryName?: string;
  subcategoryName?: string;
  subCategoryName?: string;
  isActive?: boolean;
};

/** Used for Add - multiple features in one request */
export type ReviewFeatureAddFormValues = {
  categoryId: string;
  subCategoryId: string;
  features: string[];
};

/** Used for Edit - single feature per record */
export type ReviewFeatureEditFormValues = {
  categoryId: string;
  subCategoryId: string;
  featureName: string;
};

export type ReviewFeatureListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: { startDate: string; endDate: string; dateFilterKey: string };
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
