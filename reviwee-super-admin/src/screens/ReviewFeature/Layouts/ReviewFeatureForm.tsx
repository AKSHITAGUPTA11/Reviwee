import type { FormikProps } from "formik";
import { ErrorMessage } from "formik";
import type {
  ReviewFeatureAddFormValues,
  ReviewFeatureEditFormValues,
} from "../../../models/ReviewFeature.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMTagsInput from "../../../components/UI/atoms/formFields/ATMTagsInput/ATMTagsInput";
import useCategory from "src/hooks/useCategoryOptions";
import useSubcategoryOptions from "src/hooks/useSubcategoryOptions";

type FormValues = ReviewFeatureAddFormValues | ReviewFeatureEditFormValues;

type Props<T extends FormValues = FormValues> = {
  formikProps: FormikProps<T>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const ReviewFeatureForm = <T extends FormValues>({
  formikProps,
  onClose,
  formType,
}: Props<T>) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const categoryId = values.categoryId;
  const subCategoryId = values.subCategoryId;
  const { category, isDataLoading: isCategoryLoading } = useCategory();
  const { subcategory, isDataLoading: isSubcategoryLoading } =
    useSubcategoryOptions(categoryId);

  const categoryOptions = category.map((c: any) => ({
    value: c._id ?? c.id,
    label: c.categoryName ?? c.category_name ?? "",
  }));
  const subcategoryOptions = subcategory.map((s: any) => ({
    value: s._id ?? s.id,
    label: s.subCategoryName ?? s.subcategoryName ?? s.subcategory_name ?? "",
  }));

  const categoryValue =
    categoryId && categoryOptions.length > 0
      ? categoryOptions.find((o) => o.value === categoryId) ?? null
      : null;
  const subcategoryValue =
    subCategoryId && subcategoryOptions.length > 0
      ? subcategoryOptions.find((o) => o.value === subCategoryId) ?? null
      : null;

  return (
    <ATMFormLayout
      title={
        formType === "ADD" ? "Add Review Feature" : "Edit Review Feature"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD"
          ? "Save Review Feature"
          : "Update Review Feature"
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
          value={categoryValue}
          onChange={(opt) => {
            setFieldValue("categoryId", opt?.value ?? "");
            setFieldValue("subCategoryId", "");
          }}
          placeholder="Select category"
        />

        <ATMSelect
          name="subCategoryId"
          label="Subcategory"
          required
          options={subcategoryOptions}
          isLoading={isSubcategoryLoading}
          value={subcategoryValue}
          onChange={(opt) => setFieldValue("subCategoryId", opt?.value ?? "")}
          placeholder="Select subcategory"
          disabled={!categoryId}
        />

        {formType === "ADD" ? (
          <div className="relative">
            <ATMTagsInput
              label="Features"
              tags={(values as ReviewFeatureAddFormValues).features}
              setTags={(tags) => setFieldValue("features", tags)}
              required
              addOnSpace={false}
              placeholder="Type feature and press Enter"
            />
            <ErrorMessage name="features">
              {(errMsg) => (
                <p className="font-poppins absolute text-[14px] text-start mt-0 text-red-500">
                  {errMsg}
                </p>
              )}
            </ErrorMessage>
          </div>
        ) : (
          <ATMTextField
            name="featureName"
            label="Feature Name"
            value={(values as ReviewFeatureEditFormValues).featureName}
            onChange={(e) => setFieldValue("featureName", e.target.value)}
            placeholder="Enter feature name"
            required
          />
        )}
      </div>
    </ATMFormLayout>
  );
};

export default ReviewFeatureForm;
