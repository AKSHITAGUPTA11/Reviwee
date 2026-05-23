import Dialog from "@mui/material/Dialog";
import { Form, Formik, type FormikHelpers } from "formik";
import { object, string } from "yup";
import ChangePasswordForm from "./ChangePasswordForm";
import { applyMutationToast } from "../../../../../utils/validations/mutationToast";
import type { ChangePasswordFormValues } from "../../../../../models/ChangePassword.model";
import { useChangePasswordMutation } from "../../../../../services/UserService";

type Props = {
  onClose: () => void;
};

const ChangePasswordFormWrapper = ({ onClose }: Props) => {
  const [changePassword] = useChangePasswordMutation();

  // Form Initial Values
  const initialValues: ChangePasswordFormValues = {
    currentPassword: "",
    newPassword: "",
  };

  // Validation Schema
  const validationSchema = object().shape({
    currentPassword: string().required("Please enter current password"),
    newPassword: string().required("Please enter new password"),
  });

  // Handle Submit
  const handleSubmit = async (
    values: ChangePasswordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ChangePasswordFormValues>
  ) => {
    const res = await changePassword(values);
    if (
      applyMutationToast(res, { requireTruthyStatusForSuccess: true })
    ) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  return (
    <Dialog open maxWidth="xs" fullWidth>
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            <ChangePasswordForm
              formikProps={formikProps}
              onClose={onClose}
              formType="EDIT"
            />
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default ChangePasswordFormWrapper;
