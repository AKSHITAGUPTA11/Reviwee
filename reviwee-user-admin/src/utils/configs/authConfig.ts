export const authTokenKeyName = "authToken";
export const refreshTokenKeyName = "refresh_token";

export const clearLocalStorage = () => {
  localStorage.removeItem(authTokenKeyName);
  localStorage.removeItem(refreshTokenKeyName);
  localStorage.removeItem("userData");
  localStorage.removeItem("userId");
  localStorage.removeItem("email");
  localStorage.removeItem("userName");
  localStorage.removeItem("isLoggedIn");
};
