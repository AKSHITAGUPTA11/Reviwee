import type { FormikProps } from "formik";
import type { SubcategoryFormValues } from "../../../models/Subcategory.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMSelect from "../../../components/UI/atoms/formFields/ATMSelect/ATMSelect";
import ATMTextArea from "../../../components/UI/atoms/formFields/ATMTextArea/ATMTextArea";
import useCategory from "src/hooks/useCategoryOptions";



type Props = {
  formikProps: FormikProps<SubcategoryFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const SubcategoryForm = ({
  formikProps,
  onClose,
  formType,
}: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;
  const { category, isDataLoading } = useCategory();
  const categoryOptions = category.map((c) => ({ value: c._id, label: c.categoryName }));
  const categoryValue =
    values.categoryId && categoryOptions.length > 0
      ? categoryOptions.find((o) => o.value === values.categoryId) ?? null
      : null;

  return (
    <ATMFormLayout
      title={
        formType === "ADD" ? "Add Subcategory" : "Edit Subcategory"
      }
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD"
          ? "Save Subcategory"
          : "Update Subcategory"
      }
      showCancelButton={true}
    >
      <div className="grid gap-4 md:grid-cols-2 items-start">
        <ATMTextField
          name="subCategoryName"
          label="Subcategory Name"
          required
          value={values.subCategoryName}
          onChange={(e) =>
            setFieldValue("subCategoryName", e.target.value)
          }
        />

        <ATMSelect
          name="categoryId"
          label="Category"
          required
          options={categoryOptions}
          isLoading={isDataLoading}
          value={categoryValue}
          onChange={(opt) => setFieldValue("categoryId", opt?.value ?? "")}
          placeholder="Select category"
        />
           <ATMTextField
          name="ownerLabel"
          label="Owner Label"
          value={values.ownerLabel}
          onChange={(e) =>
            setFieldValue("ownerLabel", e.target.value)
          }
        />

        <div className="md:col-span-2">
          <ATMTextArea
            name="description"
            label="Description"
            value={values.description}
            onChange={(val) => setFieldValue("description", val)}
            placeholder="Enter description"
            minRows={3}
          />
        </div>
      </div>
    </ATMFormLayout>
  );
};

export default SubcategoryForm;
