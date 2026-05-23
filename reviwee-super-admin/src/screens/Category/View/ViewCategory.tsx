import { useParams } from "react-router-dom";
import SideNavLayout from "../../../components/layouts/SideNavLayout/SideNavLayout";
import { useGetCategoryByIdQuery } from "../../../services/CategoryService";

const ViewCategory = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetCategoryByIdQuery(id ?? "", {
    skip: !id,
  });

  const source = (data?.data || data || {}) as Record<string, unknown>;
  const item = {
    id: String(source?.id ?? source?._id ?? id ?? ""),
    categoryName: String(source?.categoryName ?? source?.category_name ?? ""),
    description: String(source?.description ?? ""),
  };

  return (
    <SideNavLayout>
      <div className="p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">
              View Category
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
                <p className="text-xs text-slate-500">Category Name</p>
                <p className="text-sm font-medium text-slate-800">
                  {item.categoryName}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 md:col-span-2">
                <p className="text-xs text-slate-500">Description</p>
                <p className="text-sm font-medium text-slate-800">
                  {item.description}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </SideNavLayout>
  );
};

export default ViewCategory;
