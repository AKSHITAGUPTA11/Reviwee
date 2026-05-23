export type ReviewFeatureOptionItem = {
  featureOption: string;
  language: string;
};

export type ReviewFeatureOptionListItem = {
  id: string;
  reviewFeatureId: string;
  reviewFeatureName?: string;
  featureName?: string;
  featureOption?: string;
  language?: string;
  options?: ReviewFeatureOptionItem[];
  optionsCount?: number;
  isActive?: boolean;
};

export type ReviewFeatureOptionFormValues = {
  // UI-level fields for filtering review features.
  // These must NOT be sent in the add/update ReviewFeatureOption payload.
  categoryId?: string;
  subCategoryId?: string;
  reviewFeatureId: string;
  options: ReviewFeatureOptionItem[];
};

export type ReviewFeatureOptionEditFormValues = {
  reviewFeatureId: string;
  featureOption: string;
  language: string;
};

export type ReviewFeatureOptionListPayload = {
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
