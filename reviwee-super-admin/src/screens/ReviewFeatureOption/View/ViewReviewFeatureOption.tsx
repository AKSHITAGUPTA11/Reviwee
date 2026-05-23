import { useParams } from "react-router-dom";
import SideNavLayout from "../../../components/layouts/SideNavLayout/SideNavLayout";
import { useGetReviewFeatureOptionByIdQuery } from "../../../services/ReviewFeatureOptionService";

const ViewReviewFeatureOption = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetReviewFeatureOptionByIdQuery(id ?? "", {
    skip: !id,
  });

  const source = (data?.data || data || {}) as Record<string, unknown>;
  const isActiveVal = source.isActive ?? source.is_active;

  const item = {
    id: String(source?.id ?? source?._id ?? id ?? ""),
    reviewFeatureId: String(
      source?.reviewFeatureId ?? source?.review_feature_id ?? ""
    ),
    reviewFeatureName: String(
      source?.reviewFeatureName ??
        source?.review_feature_name ??
        source?.featureName ??
        source?.feature_name ??
        ""
    ),
    featureOption: String(source?.featureOption ?? source?.feature_option ?? ""),
    language: String(source?.language ?? ""),
    isActive:
      typeof isActiveVal === "boolean" ? isActiveVal : isActiveVal !== false,
  };

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              View Review Feature Option
            </h1>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
            >
              Back
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading...</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs text-slate-500">Feature Name</p>
                <p className="text-sm font-medium text-slate-800">
                  {item.reviewFeatureName || item.reviewFeatureId}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs text-slate-500">Feature Option</p>
                <p className="text-sm font-medium text-slate-800">
                  {item.featureOption}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Language</p>
                <p className="text-sm font-medium text-slate-800">
                  {item.language}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <span
                  className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${
                    item.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ViewReviewFeatureOption;
