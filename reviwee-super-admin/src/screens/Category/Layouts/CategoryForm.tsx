import type { FormikProps } from "formik";
import type { CategoryFormValues } from "../../../models/Category.model";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout";
import ATMTextField from "../../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMTextArea from "../../../components/UI/atoms/formFields/ATMTextArea/ATMTextArea";

type Props = {
  formikProps: FormikProps<CategoryFormValues>;
  onClose: () => void;
  formType: "ADD" | "EDIT";
};

const CategoryForm = ({ formikProps, onClose, formType }: Props) => {
  const { values, setFieldValue, handleSubmit, isSubmitting } = formikProps;

  return (
    <ATMFormLayout
      title={formType === "ADD" ? "Add Category" : "Edit Category"}
      onClose={onClose}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
      submitButtonText={
        formType === "ADD" ? "Save Category" : "Update Category"
      }
      showCancelButton={true}
    >
      <div className="flex flex-col gap-4">
        <div>
          <ATMTextField
            name="categoryName"
            label="Category Name"
            required
            value={values.categoryName}
            onChange={(e) => setFieldValue("categoryName", e.target.value)}
          />
        </div>

        <div>
          <ATMTextArea
            name="description"
            label="Description"
            value={values.description}
            onChange={(val) => setFieldValue("description", val)}
            placeholder="Enter category description"
            minRows={3}
          />
        </div>
      </div>
    </ATMFormLayout>
  );
};

export default CategoryForm;
