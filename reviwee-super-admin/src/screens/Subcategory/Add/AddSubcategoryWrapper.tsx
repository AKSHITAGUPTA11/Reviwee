import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import type { SubcategoryFormValues } from "../../../models/Subcategory.model";
import { useAddSubcategoryMutation } from "../../../services/SubcategoryService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SubcategoryForm from "../Layouts/SubcategoryForm";

type Props = {
  onClose: () => void;
};

const initialValues: SubcategoryFormValues = {
  subCategoryName: "",
  description: "",
  categoryId: "",
  ownerLabel:""
};

const validationSchema = object().shape({
  subCategoryName: string().required("Please enter subcategory name"),
  categoryId: string().required("Please select category"),
});

const AddSubcategoryWrapper = ({ onClose }: Props) => {
  const [addSubcategory] = useAddSubcategoryMutation();

  const handleSubmit = async (
    values: SubcategoryFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SubcategoryFormValues>
  ) => {
    const response = await addSubcategory(values);
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <SubcategoryForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddSubcategoryWrapper;
