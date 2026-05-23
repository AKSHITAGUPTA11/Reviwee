export type GoogleLoginData = {
  email: string;
  name: string;
  refreshToken: string;
  token: string;
  userId: string;
};

export type GoogleLoginResponse = {
  status: true;
  message: string;
  data: GoogleLoginData;
  accessToken: string;
};

export type AfterLoginData = {
  _id: string;
  name: string;
  email: string;
};

export type AfterLoginResponse = {
  status: true;
  message: string;
  data: AfterLoginData;
  token: string;
  refreshToken: string;
  accessToken: string;
};
