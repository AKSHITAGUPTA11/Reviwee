import { useNavigate } from "react-router-dom";
import type { FormikProps } from "formik";
import { useIsMobile } from "../../utils/formUtils/isMobile";
import type { ForgotPasswordFormValues } from "../../models/Login.model";
import ATMTextField from "../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMLoadingButton from "../../components/UI/atoms/ATMLoadingButton/ATMLoadingButton";

type Props = {
  formikProps: FormikProps<ForgotPasswordFormValues>;
};

const ForgotPasswordPage = ({ formikProps }: Props) => {
  const { values, setFieldValue, handleBlur, isSubmitting } = formikProps;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="w-full rounded-[26px] border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 p-5 shadow-[0_30px_60px_-34px_rgba(15,23,42,0.55)] ring-1 ring-slate-100 sm:p-6">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]">
        <span className="font-medium text-slate-500">Admin account</span>
        <span className="font-semibold text-primary">Password help</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Reviwee Business
      </p>
      <h1 className="mt-2.5 text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.9rem]">
        Forgot your password?
      </h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Enter the email you use to sign in. If an account exists, we will send reset instructions.
      </p>

      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5">
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
      </div>

      <ATMLoadingButton
        type="submit"
        className="mt-4 h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send reset link"}
      </ATMLoadingButton>

      <p className="mt-4 text-center text-sm text-slate-600">
        Remember your password?{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => navigate("/")}
        >
          Back to sign in
        </button>
      </p>
    </div>
  );
};

export default ForgotPasswordPage;
