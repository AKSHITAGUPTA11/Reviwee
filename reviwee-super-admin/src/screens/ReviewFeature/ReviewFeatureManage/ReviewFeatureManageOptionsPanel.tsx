import ATMSelect from "src/components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMLoadingButton from "src/components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import type { ReviewFeatureOptionListItem } from "src/models/ReviewFeatureOption.model";
import ReviewFeatureManageCompactPagination from "./ReviewFeatureManageCompactPagination";
import useLanguage from "src/hooks/useLaguage";

type Props = {
  selectedFeatureName: string;
  hasSelectedFeature: boolean;
  languageFilter: string;
  onLanguageChange: (lang: string) => void;
  options: ReviewFeatureOptionListItem[];
  isListLoading: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  isAddingRow: boolean;
  newOptionText: string;
  onNewOptionTextChange: (v: string) => void;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onSubmitAdd: () => void;
  isSubmittingAdd: boolean;
  canAdd: boolean;
  onEdit: (id: string) => void;
};

const ReviewFeatureManageOptionsPanel = ({
  selectedFeatureName,
  hasSelectedFeature,
  languageFilter,
  onLanguageChange,
  options,
  isListLoading,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  isAddingRow,
  newOptionText,
  onNewOptionTextChange,
  onStartAdd,
  onCancelAdd,
  onSubmitAdd,
  isSubmittingAdd,
  canAdd,
  onEdit,
}: Props) => {
  const { language } = useLanguage();
  const laguageOptions = language.map((lag) => ({
    label: lag.languageName,
    value: lag.languageName,
  }));
  const langValue =
    languageFilter && laguageOptions.length > 0
      ? (laguageOptions.find((o) => o.value === languageFilter) ?? null)
      : null;

  return (
    <div className="flex flex-col min-h-0 h-full min-w-0 flex-1 border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-3 p-3 border-b border-slate-100">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-800">
            Feature options
          </h2>
          {hasSelectedFeature ? (
            <p
              className="text-xs text-slate-500 truncate"
              title={selectedFeatureName}
            >
              {selectedFeatureName}
            </p>
          ) : (
            <p className="text-xs text-slate-500">
              Select a feature on the left
            </p>
          )}
        </div>
        <div className="w-[200px] max-w-full">
          <ATMSelect
            name=""
            label="Language"
            options={laguageOptions}
            isLoading={false}
            value={langValue}
            onChange={(opt) => onLanguageChange(String(opt?.value ?? ""))}
            placeholder="Select language"
            disabled={!hasSelectedFeature}
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2">
        {!hasSelectedFeature ? (
          <p className="text-sm text-slate-500">
            Choose a review feature to see options.
          </p>
        ) : isListLoading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : options.length === 0 ? (
          <p className="text-sm text-slate-500">
            No options for this filter. Add below.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {options.map((row) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-900 break-words">
                    {row.featureOption}
                  </p>
                  <p className="text-xs text-slate-500">
                    {row.language || "—"}
                  </p>
                </div>
                <ATMLoadingButton
                  className="!w-auto bg-transparent text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1"
                  onClick={() => onEdit(row.id)}
                >
                  Edit
                </ATMLoadingButton>
              </li>
            ))}
          </ul>
        )}
      </div>

      {hasSelectedFeature ? (
        <div className="shrink-0 mt-auto border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.04)]">
          <ReviewFeatureManageCompactPagination
            page={page}
            rowsPerPage={rowsPerPage}
            totalItems={totalItems}
            onPageChange={onPageChange}
          />
          <div className="p-2 space-y-2">
            {isAddingRow ? (
              <div className="rounded-md border border-dashed border-indigo-300 bg-indigo-50/50 p-2">
                <ATMTextField
                  name=""
                  value={newOptionText}
                  onChange={(e) => onNewOptionTextChange(e.target.value)}
                  placeholder="Option text"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      onSubmitAdd();
                    }
                    if (e.key === "Escape") onCancelAdd();
                  }}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <ATMLoadingButton
                    className="!w-auto bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 px-3"
                    onClick={onCancelAdd}
                  >
                    Cancel
                  </ATMLoadingButton>
                  <ATMLoadingButton
                    disabled={
                      isSubmittingAdd || !canAdd || !newOptionText.trim()
                    }
                    isLoading={isSubmittingAdd}
                    loadingText="Saving..."
                    className="!w-auto px-3"
                    onClick={onSubmitAdd}
                  >
                    Save
                  </ATMLoadingButton>
                </div>
              </div>
            ) : (
              <ATMLoadingButton
                disabled={!canAdd}
                className="bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onStartAdd}
              >
                Add option
              </ATMLoadingButton>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewFeatureManageOptionsPanel;
