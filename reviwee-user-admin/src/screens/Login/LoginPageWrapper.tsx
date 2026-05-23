import { Formik, Form } from "formik";
import { object, string } from "yup";
import type { FormikHelpers } from "formik";
import { useLoginMutation } from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/validations/showToaster";
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from "../../utils/configs/authConfig";
import { setAccessToken, setRefreshToken, setUserData } from "../../redux/slices/AuthSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import type { LoginFormValues, LoginApiBody } from "../../models/Login.model";
import type { GoogleLoginResponse } from "../../models/Signup.model";
import LoginPage from "./LoginPage";
import { useEffect } from "react";
import {
  getMappedRedirectPath,
  getRedirectToKeyFromAuthResponse,
} from "src/utils/redirectHelper";
import AuthShell from "../../components/auth/AuthShell";



const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  /** If user already has a session and opens login, send them to the app once (do not fight post-login onboarding navigation). */
  useEffect(() => {
    if (localStorage.getItem(authTokenKeyName)) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const afterLogin = (res: GoogleLoginResponse) => {
    const token = res?.data?.token ?? res?.token ?? "";
    const refreshToken = res?.data?.refreshToken ?? res?.refreshToken ?? "";
    const userId = res?.data?.adminId ;
    localStorage.setItem(authTokenKeyName, token);
    localStorage.setItem(refreshTokenKeyName, refreshToken);
    localStorage.setItem("userId", userId ?? "");
    localStorage.setItem("email", res?.data?.email ?? "");
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", res?.data?.name ?? "");
    // JWT is in `data.token`; AuthHOC + API layer need this in Redux to re-render after login.
    dispatch(setAccessToken(token || null));
    dispatch(setRefreshToken(refreshToken || null));
    dispatch(
      setUserData({
        name: res?.data?.name ?? "",
        email: res?.data?.email ?? "",
        userId,
      })
    );
  };

  const [login] = useLoginMutation();
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
    loginType: "email",
  };

  const validationSchema = object({
    email: string().email("Invalid email").required("Email is required"),
    password: string().required("Password is required"),
  });
  const handleSubmit = async (
    values: LoginFormValues,
    { setSubmitting }: FormikHelpers<LoginFormValues>
  ) => {
    setSubmitting(true);
    try {
      const body: LoginApiBody = {
        email: values.email,
        password: values.password,
        googleToken: ''
      };
      const res = await login(body).unwrap();
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
  };

  return (
    <AuthShell variant="login">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        validateOnBlur={true}
        validateOnChange={false}
      >
        {(formikProp) => (
          <Form>
            <LoginPage formikProps={formikProp} afterLogin={afterLogin} login={login} />
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default LoginPageWrapper;
