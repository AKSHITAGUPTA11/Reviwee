import { useNavigate } from "react-router-dom";
import type { FormikProps } from "formik";
import { GoogleLogin } from "@react-oauth/google";
import { showToast } from "../../utils/validations/showToaster";
import { useIsMobile } from "../../utils/formUtils/isMobile";
import type { LoginFormValues, LoginApiBody } from "../../models/Login.model";
import type { GoogleLoginResponse } from "../../models/Signup.model";
import ATMTextField from "../../components/UI/atoms/formFields/ATMTextField/ATMTextField";
import ATMPassword from "../../components/UI/atoms/formFields/ATMPassword/ATMPassword";
import ATMLoadingButton from "../../components/UI/atoms/ATMLoadingButton/ATMLoadingButton";
import {
  getMappedRedirectPath,
  getRedirectToKeyFromAuthResponse,
} from "src/utils/redirectHelper";

type Props = {
  formikProps: FormikProps<LoginFormValues>;
  afterLogin: (data: GoogleLoginResponse) => void;
  login: (body: LoginApiBody) => unknown;
};
const LoginPage = ({ formikProps, afterLogin, login }: Props) => {
  const { values, setFieldValue, handleBlur, isSubmitting } = formikProps;
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="w-full rounded-[26px] border border-slate-200/90 bg-linear-to-b from-white to-slate-50/80 p-5 shadow-[0_30px_60px_-34px_rgba(15,23,42,0.55)] ring-1 ring-slate-100 sm:p-6">
      <div className="mb-3 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[11px]">
        <span className="font-medium text-slate-500">Admin login</span>
        <span className="font-semibold text-primary">Fast + secure</span>
      </div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
        Reviwee Business
      </p>
      <h1 className="mt-2.5 text-[1.75rem] font-bold leading-tight tracking-tight text-slate-900 sm:text-[1.9rem]">
        Sign in to your account
      </h1>
      <p className="mt-1.5 text-sm text-slate-600">
        Continue where you left off and manage your review performance.
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

        <div className="flex justify-end">
          <button
            type="button"
            className="text-xs font-semibold text-primary hover:underline"
            onClick={() => navigate("/admin/forgot-password")}
          >
            Forgot password?
          </button>
        </div>
      </div>

      <ATMLoadingButton
        type="submit"
        className="mt-4 h-11 rounded-xl text-sm font-semibold shadow-md shadow-primary/20"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </ATMLoadingButton>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">Or continue</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="mt-3.5 rounded-xl border border-slate-200 bg-white p-3.5">
        <p className="mb-3 text-center text-xs font-medium text-slate-500">
          Continue with Google
        </p>
        <div className="flex justify-center [&_iframe]:shadow-none!">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              const tokenId = credentialResponse.credential;
              if (!tokenId) return;
              const body: LoginApiBody = { googleToken: tokenId, email: "", password: "" };
              try {
                const result = login(body) as { unwrap: () => Promise<GoogleLoginResponse> };
                const res = await result.unwrap();
                if (res.status) {
                  showToast("success", res.message);
                  afterLogin(res);
                  const redirectKey = getRedirectToKeyFromAuthResponse(res);
                  const nextPath =
                    getMappedRedirectPath(redirectKey) ?? "/dashboard";
                  navigate(nextPath, { replace: true });
                } else {
                  showToast("error", res.message);
                }
              } catch (error) {
                console.error(error);
              }
            }}
            onError={() => {}}
          />
        </div>
      </div>
      <p className="mt-2.5 text-center text-[11px] text-slate-400">
        By continuing, you agree to secure access policies.
      </p>

      <p className="mt-4 text-center text-sm text-slate-600">
        New to Reviwee?{" "}
        <button
          type="button"
          className="font-semibold text-primary hover:underline"
          onClick={() => navigate("/signup")}
        >
          Create your account
        </button>
      </p>
    </div>
  );
};
export default LoginPage;
