const { genderEnum } = require("../../../utils/enumUtils");
const profileService = require("../profile/service.profile");
const reviewFeatureService = require("../revieweFeature/service.revieweFeature");
const reviewFeatureOptionService = require("../reviewFeatureOption/service.reviewFeatureOption");
const { default: mongoose } = require("mongoose");

/* -------------------------------------------------------------------------- */
/*                                CONSTANTS                                   */
/* -------------------------------------------------------------------------- */

const reqVariableEnum = {
  product: "PRODUCT_NAME",
  service: "SERVICE_NAME",
  ownerName: "OWNER_NAME",
  staffName: "STAFF_NAME",
};

/* -------------------------------------------------------------------------- */
/*                                HELPERS                                     */
/* -------------------------------------------------------------------------- */

const getRandom = (arr) =>
  arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;

const getRandomItems = (arr, count) =>
  [...arr].sort(() => 0.5 - Math.random()).slice(0, count);

const cleanSentence = (text) => {
  if (!text) return "";
  return text.trim().replace(/[.,!?]+$/, "");
};

const replaceVariables = (template, data) =>
  template.replace(/{{(.*?)}}/g, (_, key) => {
    const value = data[key.trim()];
    return value !== undefined ? value : "";
  });

const extractVariablesFromTemplate = (text) => {
  if (!text) return [];
  const matches = text.match(/{{(.*?)}}/g);

  return matches
    ? [...new Set(matches.map((v) => v.replace(/[{}]/g, "")))]
    : [];
};

/* -------------------------------------------------------------------------- */
/*                   EXTRACT VARIABLES FROM REQUEST BODY                      */
/* -------------------------------------------------------------------------- */

const getRequestedVariables = (body) => {
  const variables = [];

  for (let key in reqVariableEnum) {
    if (body[key]) {
      variables.push(reqVariableEnum[key]);
    }
  }

  return variables;
};

/* -------------------------------------------------------------------------- */
/*                  BUILD VARIABLE MAP (TEMPLATE BASED)                       */
/* -------------------------------------------------------------------------- */

const allowedVariables = [
  "BUSINESS_NAME",
  "PRODUCT_NAME",
  "SERVICE_NAME",
  "OWNER_NAME",
  "OWNER_GENDER",
  "STAFF_NAME",
  "STAFF_GENDER",
  "LOCATION",
];

const buildVariableMap = (profile, body, template, fixedLocation = null) => {
  const map = {};
  let templateVars = extractVariablesFromTemplate(template);

  templateVars = templateVars.filter((v) => allowedVariables.includes(v));

  /* ------------------------ BUSINESS ------------------------ */
  if (templateVars.includes("BUSINESS_NAME")) {
    const alias = getRandom(profile.businessAliases);
    map.BUSINESS_NAME = alias || profile.businessDisplayName;
  }

  /* ------------------------ PRODUCT ------------------------ */
  if (templateVars.includes("PRODUCT_NAME") && body.product) {
    map.PRODUCT_NAME = body.product;
  }

  /* ------------------------ SERVICE ------------------------ */
  if (templateVars.includes("SERVICE_NAME") && body.service) {
    map.SERVICE_NAME = body.service;
  }

  /* ------------------------ OWNER ------------------------ */
  let ownerObj = null;

  if (
    templateVars.includes("OWNER_NAME") ||
    templateVars.includes("OWNER_GENDER")
  ) {
    if (body.ownerName) {
      ownerObj = { name: body.ownerName };
    }
  }

  if (templateVars.includes("OWNER_NAME") && ownerObj) {
    map.OWNER_NAME = ownerObj.name;
  }

  if (templateVars.includes("OWNER_GENDER") && ownerObj) {
    map.OWNER_GENDER =
      ownerObj.gender === genderEnum.male
        ? "He"
        : ownerObj.gender === genderEnum.female
          ? "She"
          : "They";
  }

  /* ------------------------ STAFF ------------------------ */
  let staffObj = null;

  if (
    templateVars.includes("STAFF_NAME") ||
    templateVars.includes("STAFF_GENDER")
  ) {
    if (body.staffName) {
      staffObj = { name: body.staffName };
    }
  }

  if (templateVars.includes("STAFF_NAME") && staffObj) {
    map.STAFF_NAME = staffObj.name;
  }

  if (templateVars.includes("STAFF_GENDER") && staffObj) {
    map.STAFF_GENDER = staffObj.gender;
  }

  /* ------------------------ LOCATION ------------------------ */
  if (templateVars.includes("LOCATION")) {
    map.LOCATION =
      fixedLocation ||
      getRandom(profile?.address?.localLocationAliases) ||
      profile?.address?.city ||
      "";
  }

  return map;
};

/* -------------------------------------------------------------------------- */
/*                        GET FILTERED OPTIONS                                */
/* -------------------------------------------------------------------------- */

const getFilteredOptions = async (featureIds, language, requiredVariables) => {
  const matchStage = {
    reviewFeatureId: { $in: featureIds },
  };

  if (language) {
    matchStage.language = language.toLowerCase();
  }

  return await reviewFeatureOptionService.aggregateQuery([
    { $match: matchStage },

    {
      $match: {
        $expr: {
          $or: [
            {
              $setEquals: [{ $ifNull: ["$variables", []] }, requiredVariables],
            },
            {
              $eq: [{ $ifNull: ["$variables", []] }, []],
            },
          ],
        },
      },
    },
  ]);
};

/* -------------------------------------------------------------------------- */
/*                           BUILD FINAL REVIEWS                              */
/* -------------------------------------------------------------------------- */

const buildReviews = (options, seoKeywords, profile, body) => {
  const reviews = [];

  for (let i = 0; i < 4; i++) {
    const selectedOptions = getRandomItems(options, 5);

    const location =
      getRandom(profile?.address?.localLocationAliases) ||
      profile?.address ||
      "";

    const sentences = selectedOptions.map((opt) => {
      const variableMap = buildVariableMap(
        profile,
        body,
        opt.featureOption,
        location,
      );

      return cleanSentence(replaceVariables(opt.featureOption, variableMap));
    });

    let review = sentences.join(". ") + ".";

    /* ---------------- SEO ---------------- */
    const keyword = getRandom(seoKeywords);

    if (keyword) {
      const variableMap = buildVariableMap(profile, body, keyword, location);

      const finalKeyword = cleanSentence(
        replaceVariables(keyword, variableMap),
      );

      review = `${finalKeyword}. ${review}`;
    }

    reviews.push(review);
  }

  return reviews;
};

/* -------------------------------------------------------------------------- */
/*                         MAIN SERVICE FUNCTION                              */
/* -------------------------------------------------------------------------- */

exports.generateReviewTemplates = async (businessId, language, body) => {
  try {
    const profile = await profileService.getOneByMultiField({ businessId });
    if (!profile) throw new Error("Business not found.");

    const features = await reviewFeatureService.findAllWithQuery({
      categoryId: new mongoose.Types.ObjectId(profile.categoryId),
      subCategoryId: new mongoose.Types.ObjectId(profile.subCategoryId),
    });

    if (!features.length) {
      throw new Error("No features found.");
    }

    const featureIds = features.map((f) => f._id);
    const requiredVariables = getRequestedVariables(body);

    const options = await getFilteredOptions(
      featureIds,
      language,
      requiredVariables,
    );

    if (!options.length) {
      throw new Error(`No review templates found for language - ${language}`);
    }

    const uniqueOptions = [...new Set(options.map((o) => o.featureOption))].map(
      (text) => options.find((o) => o.featureOption === text),
    );

    const seoKeywords = profile.seoKeywords || [];
    const reviews = buildReviews(uniqueOptions, seoKeywords, profile, body);

    return {
      businessName: profile.businessDisplayName,
      googleBusinessLink: profile.googleBusinessLink,
      reviews,
    };
  } catch (err) {
    console.log(err);
    throw err;
  }
};
