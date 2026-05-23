import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { array, object, string } from "yup";
import type { ReviewFeatureAddFormValues } from "../../../models/ReviewFeature.model";
import { useAddReviewFeatureMutation } from "../../../services/ReviewFeatureService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import ReviewFeatureForm from "../Layouts/ReviewFeatureForm";

type Props = {
  onClose: () => void;
};

const initialValues: ReviewFeatureAddFormValues = {
  categoryId: "",
  subCategoryId: "",
  features: [],
};

const validationSchema = object().shape({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  features: array()
    .of(string())
    .min(1, "Please add at least one feature"),
});

const AddReviewFeatureWrapper = ({ onClose }: Props) => {
  const [addReviewFeature] = useAddReviewFeatureMutation();

  const handleSubmit = async (
    values: ReviewFeatureAddFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReviewFeatureAddFormValues>
  ) => {
    const response = await addReviewFeature(values);
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
          <ReviewFeatureForm<ReviewFeatureAddFormValues>
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddReviewFeatureWrapper;
