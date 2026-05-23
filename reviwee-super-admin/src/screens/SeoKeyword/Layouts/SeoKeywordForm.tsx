import type { FormikProps } from "formik";
import type { SeoKeywordFormValues } from "../../../models/SeoKeyword.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMTagsInput from "../../../components/UI/atoms/formFields/ATMTagsInput/ATMTagsInput";
import useCategory from "src/hooks/useCategoryOptions";
import useSubcategoryOptions from "src/hooks/useSubcategoryOptions";

type Props = {
  formikProps: FormikProps<SeoKeywordFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const SeoKeywordForm = ({
  formikProps,
  onClose,
  formType,
}: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const { category, isDataLoading: isCategoryLoading } = useCategory();
  const { subcategory, isDataLoading: isSubcategoryLoading } =
    useSubcategoryOptions(values.categoryId);

  const categoryOptions = category.map((c: any) => ({
    value: c._id ?? c.id,
    label: c.categoryName ?? c.category_name ?? "",
  }));
  const subcategoryOptions = subcategory.map((s: any) => ({
    value: s._id ?? s.id,
    label: s.subCategoryName ?? s.subcategory_name ?? "",
  }));

  const categoryValue =
    values.categoryId && categoryOptions.length > 0
      ? categoryOptions.find((o) => o.value === values.categoryId) ?? null
      : null;
  const subcategoryValue =
    values.subCategoryId && subcategoryOptions.length > 0
      ? subcategoryOptions.find((o) => o.value === values.subCategoryId) ?? null
      : null;

  return (
    <ATMFormLayout
      title={
        formType === "ADD" ? "Add SEO Keywords" : "Edit SEO Keywords"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD"
          ? "Save SEO Keywords"
          : "Update SEO Keywords"
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
          label="Sub Category"
          required
          options={subcategoryOptions}
          isLoading={isSubcategoryLoading}
          value={subcategoryValue}
          onChange={(opt) => setFieldValue("subCategoryId", opt?.value ?? "")}
          placeholder="Select subcategory"
          disabled={!values.categoryId}
        />

        <ATMTagsInput
          label="SEO Keywords"
          tags={values.keywordList}
          setTags={(tags) => setFieldValue("keywordList", tags)}
          required
          addOnSpace={false}
          placeholder="Type keyword (e.g. best shoes) and press Enter"
        />
      </div>
    </ATMFormLayout>
  );
};

export default SeoKeywordForm;
