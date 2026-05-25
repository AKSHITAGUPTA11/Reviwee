const { OAuth2Client } = require("google-auth-library");
const { loginTypeEnum } = require("../../utils/enumUtils");
const config = require("../../../config/config");

const googleClient = new OAuth2Client(config.google_client_id);

const detectLoginType = (body) => {
  if (!body) return null;
  if (body.email && body.password) return loginTypeEnum.EMAIL;
  return null;
};

const verifySSOToken = async (loginType, body) => {
  switch (loginType) {
    case loginTypeEnum.GOOGLE: {
      const ticket = await googleClient.verifyIdToken({
        idToken: body.googleToken,
        audience: config.google_client_id,
      });
      const payload = ticket.getPayload();
      return {
        email: payload.email,
        name: payload.name,
        ssoId: payload.sub,
      };
    }
    case loginTypeEnum.FACEBOOK: {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${body.facebookToken}`,
      );
      const payload = await response.json();
      if (payload.error)
        throw { status: 401, message: "Invalid Facebook token." };
      return {
        email: payload.email,
        name: payload.name,
        ssoId: payload.id,
      };
    }
    case loginTypeEnum.APPLE: {
      const appleSignin = require("apple-signin-auth");
      const payload = await appleSignin.verifyIdToken(body.appleToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
      return {
        email: payload.email,
        name: body.name || "Apple User",
        ssoId: payload.sub,
      };
    }
    default:
      return null;
  }
};

module.exports = { detectLoginType, verifySSOToken };