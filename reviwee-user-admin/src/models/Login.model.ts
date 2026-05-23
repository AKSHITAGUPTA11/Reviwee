export type LoginFormValues = {
  email: string;
  loginType: "email" | "google";
  password: string;
};

export type LoginApiBody =
   { email: string; password: string;  googleToken: string}

export type ForgotPasswordBody = {
  email: string;
};

export type ForgotPasswordFormValues = {
  email: string;
};
 