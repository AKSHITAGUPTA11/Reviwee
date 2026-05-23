import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { CategoryFormValues } from "../../../models/Category.model";
import { useAddCategoryMutation } from "../../../services/CategoryService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import CategoryForm from "../Layouts/CategoryForm";

type Props = {
  onClose: () => void;
};

const initialValues: CategoryFormValues = {
  categoryName: "",
  description: "",
};

const validationSchema = object().shape({
  categoryName: string().required("Please enter category name"),
});

const AddCategoryWrapper = ({ onClose }: Props) => {
  const [addCategory] = useAddCategoryMutation();

  const handleSubmit = async (
    values: CategoryFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CategoryFormValues>
  ) => {
    const response = await addCategory(values);
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <CategoryForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddCategoryWrapper;
