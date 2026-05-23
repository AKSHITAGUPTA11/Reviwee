import type { ReactNode } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/store";
import LoginPageWrapper from "./screens/Login/LoginPageWrapper";

/**
 * Guards routes: shows login until Redux has an access token.
 * Login flows must `dispatch(setAccessToken(jwt))` so this re-renders (same-URL navigate alone is not enough).
 */
const AuthHOC = ({ component }: { component: ReactNode }) => {
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);

  return <>{accessToken ? component : <LoginPageWrapper />}</>;
};

export default AuthHOC;
