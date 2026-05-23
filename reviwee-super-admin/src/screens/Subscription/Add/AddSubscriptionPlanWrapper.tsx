import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { number, object, string } from "yup";
import type { SubscriptionPlanFormValues } from "../../../models/SubscriptionPlan.model";
import { useAddSubscriptionPlanMutation } from "../../../services/SubscriptionPlanService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import SubscriptionPlanForm from "../Layouts/SubscriptionPlanForm";

type Props = {
  onClose: () => void;
};

const initialValues: SubscriptionPlanFormValues = {
  planName: "",
  description: "",
  planPrice: 0,
  planDuration: "MONTHLY",
  credits: 0,
};

const validationSchema = object().shape({
  planName: string().required("Please enter plan name"),
  planPrice: number()
    .required("Please enter plan price")
    .min(0, "Price must be greater than or equal to 0"),
  planDuration: string().required("Please select plan duration"),
  credits: number()
    .required("Please enter credits")
    .min(0, "Credits must be greater than or equal to 0"),
});

const AddSubscriptionPlanWrapper = ({ onClose }: Props) => {
  const [addSubscriptionPlan] = useAddSubscriptionPlanMutation();

  const handleSubmit = async (
    values: SubscriptionPlanFormValues,
    { setSubmitting, resetForm }: FormikHelpers<SubscriptionPlanFormValues>
  ) => {
    const response = await addSubscriptionPlan(values);
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
          <SubscriptionPlanForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddSubscriptionPlanWrapper;
