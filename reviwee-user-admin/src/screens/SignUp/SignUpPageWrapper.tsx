import { Formik, Form } from "formik";
import { object, ref, string } from "yup";
import type { FormikHelpers } from "formik";
import { useAddUserMutation } from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/validations/showToaster";
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from "../../utils/configs/authConfig";
import { setAccessToken, setRefreshToken, setUserData } from "../../redux/slices/AuthSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import type { AfterLoginResponse } from "../../models/Signup.model";
import SignUpPage from "./SignUpPage";
import { useEffect } from "react";
import AuthShell from "../../components/auth/AuthShell";
import {
  getMappedRedirectPath,
  getRedirectToKeyFromAuthResponse,
} from "src/utils/redirectHelper";

export type SignUpFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

const SignUpPageWrapper = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [signUp] = useAddUserMutation();
  const initialValues: SignUpFormValues = {
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const validationSchema = object({
    name: string().required("name is required"),
    email: string().required("Email is required"),
    password: string().required("Password is required"),
    confirmPassword: string()
      .oneOf([ref("password")], "Passwords must match")
      .required("Confirm Password is required"),
  });
  useEffect(() => {
    if (localStorage.getItem("authToken")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);


  const afterLogin = (res: AfterLoginResponse) => {
    const token = res?.data?.token ?? res?.token ?? "";
    const refreshToken = res?.data?.refreshToken ?? res?.refreshToken ?? "";
    const userId = res?.data?.adminId ?? res?.data?._id ?? "";
    localStorage.setItem(authTokenKeyName, token);
    localStorage.setItem(refreshTokenKeyName, refreshToken);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", res?.data.name);
    localStorage.setItem("email", res?.data.email);
    localStorage.setItem("isLoggedIn", "true");
    dispatch(setAccessToken(token || null));
    dispatch(setRefreshToken(refreshToken || null));
    dispatch(
      setUserData({
        name: res?.data.name,
        email: res?.data?.email,
        userId: res?.data?.adminId,
      })
    );
  };



  const handleSubmit = async (
    values: SignUpFormValues,
    { setSubmitting }: FormikHelpers<SignUpFormValues>
  ) => {
    setSubmitting(true);
    try {
      const payload = {
        name: values.name,
        email: values.email,
        password: values.password,
      };
      const res = await signUp(payload).unwrap();
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
    <AuthShell variant="signup">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {(formikProps) => (
          <Form>
            <SignUpPage formikProps={formikProps} />
          </Form>
        )}
      </Formik>
    </AuthShell>
  );
};

export default SignUpPageWrapper;
