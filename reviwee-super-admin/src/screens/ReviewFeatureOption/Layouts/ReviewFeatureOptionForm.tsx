import type { FormikProps } from "formik";
import type {
  ReviewFeatureOptionFormValues,
  ReviewFeatureOptionItem,
} from "../../../models/ReviewFeatureOption.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import useCategory from "src/hooks/useCategoryOptions";
import useSubcategoryOptions from "src/hooks/useSubcategoryOptions";
import useReviewFeatureOptions from "src/hooks/useReviewFeatureOptions";
import { MdDelete } from "react-icons/md";
import useLanguage from "src/hooks/useLaguage";

type Props = {
  formikProps: FormikProps<ReviewFeatureOptionFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const ReviewFeatureOptionForm = ({
  formikProps,
  onClose,
  formType,
}: Props) => {

  const { language } = useLanguage();
    const laguageOptions = language.map((lag) => ({
      label: lag.languageName,
      value: lag.languageName,
    }));
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const categoryId = values.categoryId ?? "";
  const subCategoryId = values.subCategoryId ?? "";

  const { reviewFeature, isDataLoading: isReviewFeatureLoading } =
    useReviewFeatureOptions();

  const { category, isDataLoading: isCategoryLoading } = useCategory();
  const { subcategory, isDataLoading: isSubcategoryLoading } =
    useSubcategoryOptions(categoryId);

  const categoryOptions = category.map((c: any) => ({
    value: c._id ?? c.id,
    label: c.categoryName ?? c.category_name ?? "",
  }));

  const subcategoryOptions = subcategory.map((s: any) => ({
    value: s._id ?? s.id,
    label:
      s.subCategoryName ?? s.subcategoryName ?? s.subcategory_name ?? "",
  }));

  const allFeatureOptions = reviewFeature.map((f: any) => ({
    value: f._id ?? f.id,
    label: f.featureName ?? f.feature_name ?? f.features ?? "",
    categoryId: f.categoryId ?? f.category_id ?? "",
    subcategoryId:
      f.subcategoryId ??
      f.subcategory_id ??
      f.subCategoryId ??
      f.subCategory_id ??
      "",
  }));

  const featureOptions = allFeatureOptions.filter((o: any) => {
    if (categoryId && String(o.categoryId) !== categoryId) return false;
    if (subCategoryId && String(o.subcategoryId) !== subCategoryId)
      return false;
    return true;
  });

  const featureValue =
    values.reviewFeatureId && featureOptions.length > 0
      ? featureOptions.find((o) => o.value === values.reviewFeatureId) ?? null
      : null;

  const addOption = () => {
    setFieldValue("options", [
      ...values.options,
      { featureOption: "", language: "" },
    ]);
  };

  const removeOption = (index: number) => {
    const newOptions = values.options.filter((_, i) => i !== index);
    setFieldValue("options", newOptions);
  };

  const updateOption = (
    index: number,
    field: keyof ReviewFeatureOptionItem,
    value: string | boolean
  ) => {
    const newOptions = [...values.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFieldValue("options", newOptions);
  };

  return (
    <ATMFormLayout
      title={
        formType === "ADD"
          ? "Add Review Feature Option"
          : "Edit Review Feature Option"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD"
          ? "Save Review Feature Option"
          : "Update Review Feature Option"
      }
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <ATMSelect
          name="categoryId"
          label="Category"
          required
          options={categoryOptions}
          isLoading={isCategoryLoading}
          value={
            categoryId && categoryOptions.length > 0
              ? categoryOptions.find((o) => o.value === categoryId) ?? null
              : null
          }
          onChange={(opt) => {
            const newCategoryId = opt?.value ?? "";
            setFieldValue("categoryId", newCategoryId);
            setFieldValue("subCategoryId", "");
            // Feature must be reselected after filter changes.
            setFieldValue("reviewFeatureId", "");
            setFieldValue("options", [{ featureOption: "", language: "english"}]);
          }}
          placeholder="Select category"
        />

        <ATMSelect
          name="subCategoryId"
          label="Subcategory"
          required
          options={subcategoryOptions}
          isLoading={isSubcategoryLoading}
          value={
            subCategoryId && subcategoryOptions.length > 0
              ? subcategoryOptions.find((o) => o.value === subCategoryId) ?? null
              : null
          }
          onChange={(opt) => {
            const newSubCategoryId = opt?.value ?? "";
            setFieldValue("subCategoryId", newSubCategoryId);
            // Feature must be reselected after filter changes.
            setFieldValue("reviewFeatureId", "");
            setFieldValue("options", [{ featureOption: "", language: "english"}]);
          }}
          placeholder="Select subcategory"
          disabled={!categoryId}
        />

        <ATMSelect
          name="reviewFeatureId"
          label="Review Feature"
          required
          options={featureOptions}
          isLoading={isReviewFeatureLoading}
          disabled={!subCategoryId}
          value={featureValue}
          onChange={(opt) =>
            setFieldValue("reviewFeatureId", opt?.value ?? "")
          }
          placeholder="Select review feature"
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-700">
              Options
            </label>
            <button
              type="button"
              onClick={addOption}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              + Add Option
            </button>
          </div>

          {values.options.map((opt, index) => (
            <div
              key={index}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <ATMTextField
                    name={`options.${index}.featureOption`}
                    label="Feature Option"
                    required
                    value={opt.featureOption}
                    onChange={(e) =>
                      updateOption(index, "featureOption", e.target.value)
                    }
                    placeholder="Enter feature option"
                  />
                  <ATMSelect
                    name={`options.${index}.language`}
                    label="Language"
                    required
                    options={laguageOptions}
                    value={
                      laguageOptions.find((o) => o.value === opt.language) ??
                      null
                    }
                    onChange={(optVal) =>
                      updateOption(index, "language", optVal?.value ?? "")
                    }
                    placeholder="Select language"
                  />
              
                </div>
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="mt-2 rounded p-1 text-red-600 hover:bg-red-50"
                  title="Remove option"
                >
                  <MdDelete size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ATMFormLayout>
  );
};

export default ReviewFeatureOptionForm;
