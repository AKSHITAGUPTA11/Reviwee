export type LanguageListItem = {
  id: string;
  languageName: string;
  languageDescription: string;
  isActive?: boolean;
};

export type LanguageFormValues = {
  languageName: string;
  languageDescription: string;
};

export type LanguageListPayload = {
  params: string[];
  searchValue: string;
  dateFilter: { startDate: string; endDate: string; dateFilterKey: string };
  rangeFilterBy: { rangeFilterKey: string; rangeInitial: string; rangeEnd: string };
  orderBy: string;
  orderByValue: 1 | -1;
  limit: number;
  page: number;
  filterBy: { fieldName: string; value: string[] }[];
  isPaginationRequired: boolean;
};
