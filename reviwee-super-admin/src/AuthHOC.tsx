import React from "react";
import LoginPageWrapper from "./screens/Login/LoginPageWrapper";
// import { useNavigate } from "react-router-dom";

const AuthHOC = ({component}: {component:React.ReactNode}) => {
  const accessToken = localStorage.getItem("authToken");
  // const navigate = useNavigate();

  // React.useEffect(() => {
  //   if (!accessToken) {
  //     navigate("/login");
  //   } else {

  //   }
  // }, [accessToken, navigate]);
  return <>{accessToken ? <> {component} </> : <LoginPageWrapper />}</>;
};

export default AuthHOC;
