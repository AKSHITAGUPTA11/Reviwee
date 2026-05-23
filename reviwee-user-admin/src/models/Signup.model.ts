export type GoogleLoginData = {
  email: string;
  name: string;
  refreshToken?: string;
  token?: string;
  adminId?: string;
  _id?: string;
  accessToken?: string;
  /** Backend key for post-login redirect (e.g. SUBSCRIPTION, PROFILE). */
  redirectTo?: string;
};

export type GoogleLoginResponse = {
  status: true;
  message: string;
  data: GoogleLoginData;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
};

export type AfterLoginData = {
  _id: string;
  adminId?: string;
  name: string;
  email: string;
  token?: string;
  refreshToken?: string;
  accessToken?: string;
};

export type AfterLoginResponse = {
  status: true;
  message: string;
  data: AfterLoginData;
  token: string;
  refreshToken: string;
  accessToken: string;
  /** Post-signup / post-login onboarding hint (e.g. SUBSCRIPTION, PROFILE). */
  redirectTo?: string;
};
