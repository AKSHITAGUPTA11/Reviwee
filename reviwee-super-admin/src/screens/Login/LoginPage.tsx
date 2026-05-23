import type { FormikProps } from "formik";
import { useIsMobile } from "../../utils/formUtils/isMobile";
import type { LoginFormValues } from "../../models/Login.model";
import ATMTextField from "../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMPassword from "../../components/UI/atoms/formFields/ATMPassword/ATMPassword";
import ATMLoadingButton from "../../components/UI/atoms/ATMLoadingButton/ATMLoadingButton";

type Props = {
  formikProps: FormikProps<LoginFormValues>;
};
const LoginPage = ({ formikProps }: Props) => {
  const { values, setFieldValue, handleBlur, isSubmitting } = formikProps;
  const isMobile = useIsMobile();

  return (
    <div className="w-[min(460px,92vw)] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-secondary">
        Reviwee Platform
      </p>
      <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">
        Welcome Back
      </h1>
      <p className="mt-2 text-center text-sm text-slate-500">
        Login to manage your Google review growth
      </p>

      <div className="mt-6 space-y-4">
        <ATMTextField
          name="email"
          required
          value={values.email}
          onChange={(e) => setFieldValue("email", e.target.value)}
          label="Email"
          placeholder="Enter Email"
          onBlur={handleBlur}
          size={isMobile ? "small" : "medium"}
        />

        <ATMPassword
          name="password"
          required
          value={values.password}
          onChange={(e) => setFieldValue("password", e.target.value)}
          label="Password"
          placeholder="Enter Password"
          onBlur={handleBlur}
          size={isMobile ? "small" : "medium"}
        />
      </div>

      <ATMLoadingButton type="submit" className="mt-5 h-11 rounded-lg w-full" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </ATMLoadingButton>
    
    </div>
  );
};
export default LoginPage;
