import Dialog from "@mui/material/Dialog";
import { Formik, type FormikHelpers } from "formik";
import { object, ref, string } from "yup";
import type { CustomerListItem } from "../../../models/Customer.model";
import { useResetCustomerPasswordMutation } from "../../../services/CustomerService";
import ATMFormLayout from "../../../components/UI/atoms/ATMFormLayout/ATMFormLayout";
import ATMPassword from "../../../components/UI/atoms/formFields/ATMPassword/ATMPassword";
import { applyMutationToast } from "../../../utils/validations/mutationToast";

type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

type Props = {
  customer: CustomerListItem;
  onClose: () => void;
};

const ResetCustomerPasswordDialog = ({ customer, onClose }: Props) => {
  const [resetCustomerPassword] = useResetCustomerPasswordMutation();

  const initialValues: ResetPasswordFormValues = {
    newPassword: "",
    confirmPassword: "",
  };

  const validationSchema = object().shape({
    newPassword: string().required("Please enter new password"),
    confirmPassword: string()
      .required("Please confirm password")
      .oneOf([ref("newPassword")], "Passwords must match"),
  });

  const handleSubmit = async (
    values: ResetPasswordFormValues,
    { setSubmitting, resetForm }: FormikHelpers<ResetPasswordFormValues>
  ) => {
    const response = await resetCustomerPassword({
      id: customer.id,
      body: { password: values.newPassword },
    });
    if (applyMutationToast(response)) {
      resetForm();
      onClose();
    }
    setSubmitting(false);
  };

  const subtitle = [customer.name, customer.email].filter(Boolean).join(" · ");

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <ATMFormLayout
            title="Reset password"
            onClose={onClose}
            onSubmit={formikProps.handleSubmit}
            isLoading={formikProps.isSubmitting}
            submitButtonText="Reset password"
            showCancelButton
            fitContent
          >
            <div className="flex flex-col gap-4">
              {subtitle ? (
                <p className="text-sm text-slate-600">{subtitle}</p>
              ) : null}
              <ATMPassword
                name="newPassword"
                value={formikProps.values.newPassword}
                onChange={(e) =>
                  formikProps.setFieldValue("newPassword", e.target.value)
                }
                label="New password"
                required
                placeholder="Enter new password"
                onBlur={formikProps.handleBlur}
              />
              <ATMPassword
                name="confirmPassword"
                value={formikProps.values.confirmPassword}
                onChange={(e) =>
                  formikProps.setFieldValue("confirmPassword", e.target.value)
                }
                label="Confirm password"
                required
                placeholder="Confirm new password"
                onBlur={formikProps.handleBlur}
              />
            </div>
          </ATMFormLayout>
        )}
      </Formik>
    </Dialog>
  );
};

export default ResetCustomerPasswordDialog;
