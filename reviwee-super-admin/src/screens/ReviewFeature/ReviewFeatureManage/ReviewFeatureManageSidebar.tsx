import ATMLoadingButton from "src/components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import ATMTextField from "src/components/UI/atoms/formFields/ATMTextField/ATMTextField";
import type { ReviewFeatureListItem } from "src/models/ReviewFeature.model";
import ReviewFeatureManageCompactPagination from "./ReviewFeatureManageCompactPagination";

type Props = {
  features: ReviewFeatureListItem[];
  selectedFeatureId: string;
  onSelectFeature: (row: ReviewFeatureListItem) => void;
  isListLoading: boolean;
  filtersReady: boolean;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (p: number) => void;
  isAddingRow: boolean;
  newFeatureName: string;
  onNewFeatureNameChange: (v: string) => void;
  onStartAdd: () => void;
  onCancelAdd: () => void;
  onSubmitAdd: () => void;
  isSubmittingAdd: boolean;
};

const ReviewFeatureManageSidebar = ({
  features,
  selectedFeatureId,
  onSelectFeature,
  isListLoading,
  filtersReady,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  isAddingRow,
  newFeatureName,
  onNewFeatureNameChange,
  onStartAdd,
  onCancelAdd,
  onSubmitAdd,
  isSubmittingAdd,
}: Props) => {
  return (
    <div className="flex flex-col min-h-0 h-full w-full md:w-[min(100%,380px)] shrink-0 border border-slate-200 rounded-lg bg-white overflow-hidden">
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-slate-100">
        <h2 className="text-sm font-semibold text-slate-800">Review Features</h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
        {!filtersReady ? (
          <p className="text-sm text-slate-500 p-2">
            Select category and subcategory to load features.
          </p>
        ) : isListLoading ? (
          <p className="text-sm text-slate-500 p-2">Loading…</p>
        ) : features.length === 0 ? (
          <p className="text-sm text-slate-500 p-2">No features yet. Add one below.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {features.map((row) => (
              <li key={row.id}>
                <button
                  type="button"
                  onClick={() => onSelectFeature(row)}
                  className={`w-full text-left rounded-md px-3 py-2 text-sm transition-colors ${
                    selectedFeatureId === row.id
                      ? "bg-indigo-100 text-indigo-900 font-medium"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  {row.featureName}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {filtersReady ? (
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
                  value={newFeatureName}
                  onChange={(e) => onNewFeatureNameChange(e.target.value)}
                  placeholder="Feature name"
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
                    disabled={isSubmittingAdd || !newFeatureName.trim()}
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
                className="bg-white text-slate-800 border border-slate-200 hover:bg-slate-50"
                onClick={onStartAdd}
              >
                Add feature
              </ATMLoadingButton>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReviewFeatureManageSidebar;
