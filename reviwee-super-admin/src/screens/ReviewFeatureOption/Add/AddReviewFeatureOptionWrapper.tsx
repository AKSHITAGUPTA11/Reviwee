import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, string, array } from "yup";
import type {
  ReviewFeatureOptionFormValues,
  ReviewFeatureOptionItem,
} from "../../../models/ReviewFeatureOption.model";
import { useAddReviewFeatureOptionMutation } from "../../../services/ReviewFeatureOptionService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import ReviewFeatureOptionForm from "../Layouts/ReviewFeatureOptionForm";

type Props = {
  onClose: () => void;
};

const initialValues: ReviewFeatureOptionFormValues = {
  categoryId: "",
  subCategoryId: "",
  reviewFeatureId: "",
  options: [{ featureOption: "", language: "english"}],
};

const optionSchema = object().shape({
  featureOption: string().required("Please enter feature option"),
  language: string().required("Please select language"),
});

const validationSchema = object().shape({
  categoryId: string().required("Please select category"),
  subCategoryId: string().required("Please select subcategory"),
  reviewFeatureId: string().required("Please select review feature"),
  options: array()
    .of(optionSchema)
    .min(1, "At least one option is required")
    .test(
      "non-empty-options",
      "All options must have feature option text",
      (options) =>
        Array.isArray(options) &&
        options.every((o: ReviewFeatureOptionItem) => o?.featureOption?.trim()),
    ),
});

const AddReviewFeatureOptionWrapper = ({ onClose }: Props) => {
  const [addReviewFeatureOption] = useAddReviewFeatureOptionMutation();

  const handleSubmit = async (
    values: ReviewFeatureOptionFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ReviewFeatureOptionFormValues>
  ) => {
    // API payload must only include reviewFeatureId + options.
    const response = await addReviewFeatureOption({
      reviewFeatureId: values.reviewFeatureId,
      options: values.options,
    });
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
          <ReviewFeatureOptionForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddReviewFeatureOptionWrapper;
