import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { boolean, number, object } from "yup";
import type { CreditConfigFormValues } from "../../../models/CreditConfig.model";
import { useAddCreditConfigMutation } from "../../../services/CreditConfigService";
import { applyMutationToast } from "../../../utils/validations/mutationToast";
import CreditConfigForm from "../Layouts/CreditConfigForm";

type Props = {
  onClose: () => void;
};

const initialValues: CreditConfigFormValues = {
  credit: 0,
  minWords: 0,
  maxWords: 0,
  isDefault: false,
};

const validationSchema = object().shape({
  credit: number()
    .required("Credit score is required")
    .min(0, "Must be 0 or greater"),
  minWords: number()
    .required("Min words is required")
    .integer("Must be a whole number")
    .min(0, "Must be 0 or greater"),
  maxWords: number()
    .required("Max words is required")
    .integer("Must be a whole number")
    .min(0, "Must be 0 or greater"),
  isDefault: boolean(),
});

const AddCreditConfigWrapper = ({ onClose }: Props) => {
  const [addCreditConfig] = useAddCreditConfigMutation();

  const handleSubmit = async (
    values: CreditConfigFormValues,
    { setSubmitting, resetForm }: FormikHelpers<CreditConfigFormValues>
  ) => {
    const payload = {
      minWords: values.minWords,
      maxWords: values.maxWords,
      credit: values.credit,
    };
    const response = await addCreditConfig(payload);
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
          <CreditConfigForm
            formikProps={formikProps}
            onClose={onClose}
            formType="ADD"
          />
        )}
      </Formik>
    </Dialog>
  );
};

export default AddCreditConfigWrapper;
