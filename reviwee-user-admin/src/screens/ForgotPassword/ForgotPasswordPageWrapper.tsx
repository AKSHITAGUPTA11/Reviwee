import { Formik, Form } from "formik";
import { object, string } from "yup";
import type { FormikHelpers } from "formik";
import { useForgotPasswordMutation } from "../../services/UserService";
import type { ForgotPasswordFormValues } from "../../models/Login.model";
import { showToast } from "../../utils/validations/showToaster";
import AuthShell from "../../components/auth/AuthShell";
import ForgotPasswordPage from "./ForgotPasswordPage";

const ForgotPasswordPageWrapper = () => {
  const [forgotPassword] = useForgotPasswordMutation();
  const initialValues: ForgotPasswordFormValues = {
    email: "",
  };

  const validationSchema = object({
    email: string().email("Invalid email").required("Email is required"),
  });

  const handleSubmit = async (
    values: ForgotPasswordFormValues,
    { setSubmitting }: FormikHelpers<ForgotPasswordFormValues>
  ) => {
    setSubmitting(true);
    try {
      const res = (await forgotPassword({ email: values.email }).unwrap()) as {
        status?: boolean;
        message?: string;
      };
      if (res.status) {
        showToast("success", res.message ?? "Check your email for next steps.");
      } else {
        showToast("error", res.message ?? "Something went wrong.");
      }
    } catch (error) {
      console.error(error);
      showToast("error", "Unable to send reset email. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell variant="forgot">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={false}
      >
        {(formikProp) => (
          <Form>
            <ForgotPasswordPage formikProps={formikProp} />
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default ForgotPasswordPageWrapper;
