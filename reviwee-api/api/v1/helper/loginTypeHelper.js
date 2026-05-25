const { OAuth2Client } = require("google-auth-library");
const { loginTypeEnum } = require("../../utils/enumUtils");
const config = require("../../../config/config");

const googleClient = new OAuth2Client(config.google_client_id);

/**
 * Detects loginType dynamically from the request body.
 *
 * Rules:
 *  - has googleToken  → "google"
 *  - has facebookToken → "facebook"
 *  - has appleToken   → "apple"
 *  - has email + password → "email"
 */
const detectLoginType = (body) => {
  if (!body) return null;  
  if (body.googleToken) return loginTypeEnum.GOOGLE;
  if (body.facebookToken) return loginTypeEnum.FACEBOOK;
  if (body.appleToken) return loginTypeEnum.APPLE;
  if (body.email && body.password) return loginTypeEnum.EMAIL;
  return null;
};

/**
 * Verifies SSO token and returns { email, name, ssoId }
 * based on detected loginType.
 */
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
        ssoId: payload.sub, // Google unique user ID
      };
    }

    case loginTypeEnum.FACEBOOK: {
      // Verify Facebook token via Graph API
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email&access_token=${body.facebookToken}`,
      );
      const payload = await response.json();
      if (payload.error)
        throw { status: 401, message: "Invalid Facebook token." };
      return {
        email: payload.email,
        name: payload.name,
        ssoId: payload.id, // Facebook unique user ID
      };
    }

    case loginTypeEnum.APPLE: {
      // Apple token verification (using apple-signin-auth package)
      const appleSignin = require("apple-signin-auth");
      const payload = await appleSignin.verifyIdToken(body.appleToken, {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      });
      return {
        email: payload.email,
        name: body.name || "Apple User", // Apple only sends name on first login
        ssoId: payload.sub, // Apple unique user ID
      };
    }

    default:
      return null;
  }
};

module.exports = { detectLoginType, verifySSOToken };
