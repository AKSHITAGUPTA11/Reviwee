import { Formik, Form } from "formik";
import { object, string } from "yup";
import type { FormikHelpers } from "formik";
import { useLoginMutation } from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import { showToast } from "../../utils/validations/showToaster";
import { getApiErrorMessage } from "../../utils/validations/mutationToast";
import {
  authTokenKeyName,
  refreshTokenKeyName,
} from "../../utils/configs/authConfig";
import { setAccessToken, setUserData } from "../../redux/slices/AuthSlice";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../redux/store";
import type { LoginFormValues } from "../../models/Login.model";
import type { GoogleLoginResponse } from "../../models/Signup.model";
import LoginPage from "./LoginPage";
import { useEffect } from "react";



const LoginPageWrapper = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const authToken = localStorage.getItem("authToken");
  useEffect(() => {
    if (!authToken) {
      navigate("/");
    } else {
      navigate("/dashboard");
    }
  }, [authToken, navigate]);

  const afterLogin = (res: GoogleLoginResponse) => {
    localStorage.setItem(authTokenKeyName, res?.data?.token);
    localStorage.setItem(refreshTokenKeyName, res?.data?.refreshToken);
    localStorage.setItem("userId", res?.data.userId);
    localStorage.setItem("email", res?.data.email);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userName", res?.data.name);
    dispatch(setAccessToken(res?.accessToken));
    dispatch(
      setUserData({
        name: res.data.name,
        email: res?.data?.email,
        userId: res?.data?.userId,
      })
    );
  };

  const [login] = useLoginMutation();
  const initialValues: LoginFormValues = {
    email: "",
    password: "",
    googleToken: "",
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
      const res = await login(values).unwrap();
      if (res.status) {
        showToast("success", res.message);
        afterLogin(res);
        navigate("/dashboard");
      } else {
        showToast("error", res.message);
      }
    } catch (error) {
      showToast("error", getApiErrorMessage(error) ?? "Request failed");
    }
  };

  return (
      <div className="flex min-h-screen items-center justify-center px-4 py-8">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnBlur={true}
          validateOnChange={false}
        >
          {(formikProp) => (
            <Form>
              <LoginPage formikProps={formikProp}/>
            </Form>
          )}
        </Formik>
      </div>
  );
};

export default LoginPageWrapper;
