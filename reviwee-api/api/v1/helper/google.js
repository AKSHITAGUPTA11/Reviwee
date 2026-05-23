const express = require("express");
const axios = require("axios");
const router = express.Router();

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI =
  "https://reviewee-api.codioticdemo.com/v1/google/auth/google/callback";

// Redirect user to Google Login
router.get("/auth/google", (req, res) => {
  const scope = encodeURIComponent(
    "https://www.googleapis.com/auth/business.manage",
  );

  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${REDIRECT_URI}` +
    `&response_type=code` +
    `&scope=${scope}` +
    `&access_type=offline` +
    `&prompt=consent`;

  res.redirect(authUrl);
});

// Google callback → exchange code for token
router.get("/auth/google/callback", async (req, res) => {
  try {
    console.log("CODE:", req.query.code);
    const code = req.query.code;

    // Exchange code for token
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    });

    console.log("HIT AUTH GOOGLE");

    const { access_token, refresh_token } = tokenRes.data;

    // Get Business Accounts
    const accountsRes = await axios.get(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const accounts = accountsRes.data.accounts || [];

    let allLocations = [];

    // Loop accounts → get locations
    for (const acc of accounts) {
      const accountName = acc.name; // accounts/123

      const locationsRes = await axios.get(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations`,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      );

      const locations = locationsRes.data.locations || [];

      const formatted = locations.map((loc) => ({
        accountId: accountName,
        locationId: loc.name,
        name: loc.title,
        address: loc.storefrontAddress?.locality || "",
      }));

      allLocations.push(...formatted);
    }

    // send data to frontend
    res.json({
      success: true,
      access_token,
      refresh_token,
      profiles: allLocations,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching business profiles",
    });
  }
});

module.exports = router;
