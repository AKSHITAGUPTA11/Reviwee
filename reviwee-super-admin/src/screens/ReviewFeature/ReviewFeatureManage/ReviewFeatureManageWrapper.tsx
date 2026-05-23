import { useCallback, useEffect, useMemo, useState } from "react";
import SideNavLayout from "src/components/layouts/SideNavLayout/SideNavLayout";
import ATMPageHeader from "src/components/UI/atoms/ATMPageHeader/ATMPageHeader";
import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import useCategory from "src/hooks/useCategoryOptions";
import useSubcategoryOptions from "src/hooks/useSubcategoryOptions";
import type {
  ReviewFeatureListItem,
  ReviewFeatureListPayload,
} from "src/models/ReviewFeature.model";
import type {
  ReviewFeatureOptionListItem,
  ReviewFeatureOptionListPayload,
} from "src/models/ReviewFeatureOption.model";
import {
  useGetAllReviewFeatureDataQuery,
  useAddReviewFeatureMutation,
} from "src/services/ReviewFeatureService";
import {
  useGetAllReviewFeatureOptionDataQuery,
  useAddReviewFeatureOptionMutation,
} from "src/services/ReviewFeatureOptionService";
import { applyMutationToast } from "src/utils/validations/mutationToast";
import EditReviewFeatureOptionWrapper from "src/screens/ReviewFeatureOption/Edit/EditReviewFeatureOptionWrapper";
import ReviewFeatureManageSidebar from "./ReviewFeatureManageSidebar";
import ReviewFeatureManageOptionsPanel from "./ReviewFeatureManageOptionsPanel";

const mapFeatureRows = (data: unknown): ReviewFeatureListItem[] => {
  const source = (data as { data?: unknown })?.data ?? [];
  if (!Array.isArray(source) || source.length === 0) return [];
  return source.map((s: Record<string, unknown>) => {
    const id = String(s.id ?? s._id ?? "");
    const isActiveVal = s.isActive ?? s.is_active;
    const featureName = String(
      s.featureName ?? s.feature_name ?? s.features ?? ""
    );
    return {
      id,
      categoryId: String(s.categoryId ?? s.category_id ?? ""),
      subcategoryId: String(s.subcategoryId ?? s.subcategory_id ?? ""),
      featureName,
      categoryName: String(s.categoryName ?? s.category_name ?? ""),
      subCategoryName: String(s.subCategoryName ?? s.subcategory_name ?? ""),
      isActive:
        typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
    };
  });
};

const mapOptionRows = (data: unknown): ReviewFeatureOptionListItem[] => {
  const source = (data as { data?: unknown })?.data ?? [];
  if (!Array.isArray(source) || source.length === 0) return [];
  return source.map((s: Record<string, unknown>) => {
    const id = String(s.id ?? s._id ?? "");
    const isActiveVal = s.isActive ?? s.is_active;
    return {
      id,
      reviewFeatureId: String(s.reviewFeatureId ?? s.review_feature_id ?? ""),
      reviewFeatureName: String(
        s.reviewFeatureName ??
          s.review_feature_name ??
          s.featureName ??
          s.feature_name ??
          ""
      ),
      categoryName: String(s.categoryName ?? s.category_name ?? ""),
      subCategoryName: String(
        s.subCategoryName ??
          s.subcategoryName ??
          s.subcategory_name ??
          s.subCategory_name ??
          ""
      ),
      featureOption: String(s.featureOption ?? s.feature_option ?? ""),
      language: String(s.language ?? ""),
      isActive:
        typeof isActiveVal === "boolean" ? isActiveVal : Boolean(isActiveVal),
    };
  });
};

const ReviewFeatureManageWrapper = () => {
  const [categoryId, setCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [selectedFeatureId, setSelectedFeatureId] = useState("");
  const [selectedFeatureName, setSelectedFeatureName] = useState("");
  const [languageFilter, setLanguageFilter] = useState("");

  const [featurePage, setFeaturePage] = useState(1);
  const [optionPage, setOptionPage] = useState(1);
  const featureRowsPerPage = 20;
  const optionRowsPerPage = 20;

  const [isAddingFeature, setIsAddingFeature] = useState(false);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [newOptionText, setNewOptionText] = useState("");

  const [editOptionId, setEditOptionId] = useState<string | null>(null);

  const { category, isDataLoading: isCategoryLoading } = useCategory();
  const { subcategory, isDataLoading: isSubcategoryLoading } =
    useSubcategoryOptions(categoryId);

  const categoryOptions = category.map((c: Record<string, unknown>) => ({
    value: String(c._id ?? c.id ?? ""),
    label: String(c.categoryName ?? c.category_name ?? ""),
  }));
  const subcategoryOptions = subcategory.map((s: Record<string, unknown>) => ({
    value: String(s._id ?? s.id ?? ""),
    label: String(
      s.subCategoryName ?? s.subcategoryName ?? s.subcategory_name ?? ""
    ),
  }));

  const filtersReady = Boolean(categoryId && subCategoryId);

  const featurePayload: ReviewFeatureListPayload = useMemo(
    () => ({
      params: ["featureName"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1,
      limit: featureRowsPerPage,
      page: featurePage,
      filterBy: filtersReady
        ? [
            { fieldName: "categoryId", value: [categoryId] },
            { fieldName: "subCategoryId", value: [subCategoryId] },
          ]
        : [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    }),
    [
      categoryId,
      subCategoryId,
      featurePage,
      featureRowsPerPage,
      filtersReady,
    ]
  );

  const {
    data: featureData,
    isLoading: isFeatureLoading,
    isFetching: isFeatureFetching,
  } = useGetAllReviewFeatureDataQuery(featurePayload, {
    skip: !filtersReady,
  });

  const featureRows = useMemo(
    () => (!filtersReady ? [] : mapFeatureRows(featureData)),
    [featureData, filtersReady]
  );
  const featureTotal = !filtersReady
    ? 0
    : (featureData as { totalItem?: number; total?: number })?.totalItem ??
      (featureData as { totalItem?: number; total?: number })?.total ??
      featureRows.length;

  const optionFiltersReady = Boolean(selectedFeatureId);

  const optionPayload: ReviewFeatureOptionListPayload = useMemo(() => {
    const filterBy: { fieldName: string; value: string[] }[] = [
      { fieldName: "reviewFeatureId", value: [selectedFeatureId] },
    ];
    if (languageFilter) {
      filterBy.push({ fieldName: "language", value: [languageFilter] });
    }
    return {
      params: ["featureOption"],
      searchValue: "",
      dateFilter: { startDate: "", endDate: "", dateFilterKey: "" },
      rangeFilterBy: { rangeFilterKey: "", rangeInitial: "", rangeEnd: "" },
      orderBy: "createdAt",
      orderByValue: -1,
      limit: optionRowsPerPage,
      page: optionPage,
      filterBy: optionFiltersReady
        ? filterBy
        : [{ fieldName: "", value: [] }],
      isPaginationRequired: true,
    };
  }, [
    selectedFeatureId,
    languageFilter,
    optionPage,
    optionRowsPerPage,
    optionFiltersReady,
  ]);

  const {
    data: optionData,
    isLoading: isOptionLoading,
    isFetching: isOptionFetching,
  } = useGetAllReviewFeatureOptionDataQuery(optionPayload, {
    skip: !optionFiltersReady,
  });

  const optionRows = useMemo(
    () => (!optionFiltersReady ? [] : mapOptionRows(optionData)),
    [optionData, optionFiltersReady]
  );
  const optionTotal = !optionFiltersReady
    ? 0
    : (optionData as { totalItem?: number; total?: number })?.totalItem ??
      (optionData as { totalItem?: number; total?: number })?.total ??
      optionRows.length;

  const [addReviewFeature, { isLoading: isSubmittingFeature }] =
    useAddReviewFeatureMutation();
  const [addReviewFeatureOption, { isLoading: isSubmittingOption }] =
    useAddReviewFeatureOptionMutation();

  useEffect(() => {
    setSelectedFeatureId("");
    setSelectedFeatureName("");
    setLanguageFilter("");
    setFeaturePage(1);
    setIsAddingFeature(false);
    setNewFeatureName("");
  }, [categoryId, subCategoryId]);

  useEffect(() => {
    setOptionPage(1);
    setIsAddingOption(false);
    setNewOptionText("");
  }, [selectedFeatureId]);

  useEffect(() => {
    setOptionPage(1);
  }, [languageFilter]);

  const handleCategoryChange = useCallback((id: string) => {
    setCategoryId(id);
    setSubCategoryId("");
  }, []);

  const handleSelectFeature = useCallback((row: ReviewFeatureListItem) => {
    setSelectedFeatureId(row.id);
    setSelectedFeatureName(row.featureName);
  }, []);

  const handleAddFeature = useCallback(async () => {
    const name = newFeatureName.trim();
    if (!name || !categoryId || !subCategoryId) return;
    const res = await addReviewFeature({
      categoryId,
      subCategoryId,
      features: [name],
    });
    if (!applyMutationToast(res)) return;
    setNewFeatureName("");
    setIsAddingFeature(false);
  }, [addReviewFeature, categoryId, newFeatureName, subCategoryId]);

  const handleAddOption = useCallback(async () => {
    const text = newOptionText.trim();
    if (!text || !selectedFeatureId || !languageFilter) return;
    const res = await addReviewFeatureOption({
      reviewFeatureId: selectedFeatureId,
      options: [{ featureOption: text, language: languageFilter }],
    });
    if (!applyMutationToast(res)) return;
    setNewOptionText("");
  }, [
    addReviewFeatureOption,
    languageFilter,
    newOptionText,
    selectedFeatureId,
  ]);

  const isFeatureListBusy = isFeatureLoading || isFeatureFetching;
  const isOptionListBusy = isOptionLoading || isOptionFetching;

  const categorySelectValue =
    categoryId && categoryOptions.length > 0
      ? categoryOptions.find((o) => o.value === categoryId) ?? null
      : null;
  const subcategorySelectValue =
    subCategoryId && subcategoryOptions.length > 0
      ? subcategoryOptions.find((o) => o.value === subCategoryId) ?? null
      : null;

  return (
    <SideNavLayout>
      <div className="flex flex-1 flex-col min-h-0 overflow-hidden py-1 px-2">
        <div className="sticky top-0 z-10 bg-white p-4 md:static shrink-0">
          <ATMPageHeader
            moduleName="REVIEW FEATURE"
            pageTitle="Review features & options"
            searchValue=""
            onSearchChange={() => {}}
            debounceMs={300}
            hideSearchBox
            hideAddButton
          />
        </div>

        <div className="flex flex-wrap items-end gap-3 px-2 pb-3 shrink-0 border-b border-slate-100">
          <div className="flex-1 min-w-[160px] max-w-md">
            <ATMSelect
              name=""
              label="Category"
              options={categoryOptions}
              isLoading={isCategoryLoading}
              value={categorySelectValue}
              onChange={(opt) => handleCategoryChange(String(opt?.value ?? ""))}
              placeholder="Select category"
            />
          </div>
          <div className="flex-1 min-w-[160px] max-w-md">
            <ATMSelect
              name=""
              label="Subcategory"
              options={subcategoryOptions}
              isLoading={isSubcategoryLoading}
              value={subcategorySelectValue}
              onChange={(opt) =>
                setSubCategoryId(String(opt?.value ?? ""))
              }
              placeholder="Select subcategory"
              disabled={!categoryId}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0 gap-4 px-2 pb-2 pt-3 md:min-h-[min(560px,calc(100vh-240px))]">
          <div className="flex flex-col min-h-0 flex-1 md:w-[min(100%,380px)] md:shrink-0 md:flex-initial">
            <ReviewFeatureManageSidebar
              filtersReady={filtersReady}
              features={featureRows}
              selectedFeatureId={selectedFeatureId}
              onSelectFeature={handleSelectFeature}
              isListLoading={filtersReady && isFeatureListBusy}
              page={featurePage}
              rowsPerPage={featureRowsPerPage}
              totalItems={featureTotal}
              onPageChange={setFeaturePage}
              isAddingRow={isAddingFeature}
              newFeatureName={newFeatureName}
              onNewFeatureNameChange={setNewFeatureName}
              onStartAdd={() => {
                setIsAddingFeature(true);
                setNewFeatureName("");
              }}
              onCancelAdd={() => {
                setIsAddingFeature(false);
                setNewFeatureName("");
              }}
              onSubmitAdd={handleAddFeature}
              isSubmittingAdd={isSubmittingFeature}
            />
          </div>

          <div className="flex flex-col min-h-0 flex-1 md:min-h-0">
            <ReviewFeatureManageOptionsPanel
              selectedFeatureName={selectedFeatureName}
              hasSelectedFeature={optionFiltersReady}
              languageFilter={languageFilter}
              onLanguageChange={setLanguageFilter}
              options={optionRows}
              isListLoading={optionFiltersReady && isOptionListBusy}
              page={optionPage}
              rowsPerPage={optionRowsPerPage}
              totalItems={optionTotal}
              onPageChange={setOptionPage}
              isAddingRow={isAddingOption}
              newOptionText={newOptionText}
              onNewOptionTextChange={setNewOptionText}
              onStartAdd={() => {
                setIsAddingOption(true);
                setNewOptionText("");
              }}
              onCancelAdd={() => {
                setIsAddingOption(false);
                setNewOptionText("");
              }}
              onSubmitAdd={handleAddOption}
              isSubmittingAdd={isSubmittingOption}
              canAdd={Boolean(languageFilter)}
              onEdit={(id) => setEditOptionId(id)}
            />
          </div>
        </div>
      </div>

      {editOptionId ? (
        <EditReviewFeatureOptionWrapper
          selectedReviewFeatureOptionId={editOptionId}
          onClose={() => setEditOptionId(null)}
        />
      ) : null}
    </SideNavLayout>
  );
};

export default ReviewFeatureManageWrapper;
