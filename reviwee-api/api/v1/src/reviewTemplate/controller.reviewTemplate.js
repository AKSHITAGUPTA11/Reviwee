const logger = require("../../../../config/logger");
const reviewsService = require("../reviews/service.reviews");
const reviewTemplateService = require("../reviewTemplate/service.reviewTemplate");
const productService = require("../product/service.product");
const serviceFile = require("../service/service.service");
const profileService = require("../profile/service.profile");
const customerSubscriptionService = require("../customerSubcription/service.customerSubcription");
const creditLogService = require("../creditConfig/schema.creditLogs");
const { errorRes } = require("../../../../utilities/resError");
const ApiError = require("../../../../utilities/apiErrorUtils");
const httpStatus = require("http-status");
const mongoose = require("mongoose");
const moment = require("moment");
const {
  generateByAI,
} = require("../../../../third-party-services/AI/aiProvider");
const {
  buildPrompt,
} = require("../../../../third-party-services/AI/promptBuilder");
const { planStatusEnum } = require("../../../utils/enumUtils");

// ========================= HELPER: CREDIT DEDUCTION =========================
const deductCredits = async ({ profile, subscription, perRequestCredit }) => {
  try {
    // ================= VALIDATION =================
    if (profile.remainingCredits < perRequestCredit) {
      throw new ApiError(400, "Insufficient credits.");
    }

    // ================= PROFILE UPDATE =================
    const updatedProfile = await profileService.updateMany(
      {
        userId: profile.userId,
        remainingCredits: { $gte: perRequestCredit },
      },
      {
        $inc: { remainingCredits: -perRequestCredit },
      },
      { new: true },
    );

    if (!updatedProfile) {
      throw new ApiError(400, "Credits already used, try again.");
    }

    // ================= SUBSCRIPTION UPDATE =================
    const updatedSubscription =
      await customerSubscriptionService.getOneAndUpdate(
        {
          _id: subscription._id,
        },
        {
          $inc: { remainingCredits: -perRequestCredit },
        },
        { new: true },
      );

    if (!updatedSubscription) {
      throw new ApiError(400, "Subscription credits already used.");
    }

    // ================= AUTO EXPIRE =================
    if (updatedSubscription.remainingCredits <= 0) {
      await customerSubscriptionService.getOneAndUpdate(
        { _id: subscription._id },
        {
          $set: {
            planStatus: planStatusEnum.expired,
            isActive: false,
          },
        },
      );
    }

    /**
     * getRemainingCredits
     */
    let creditsInProfile = await profileService.getOneByMultiField({
      _id: profile._id,
    });
    let remainingProfileCredits = creditsInProfile?.remainingCredits;

    return remainingProfileCredits;
  } catch (err) {
    console.log("deductCredits error:", err.message);
    throw err;
  }
};

// ========================= GET REVIEW API =========================
exports.getReviewTemplates = async (req, res) => {
  try {
    const { businessid } = req.params;
    

    // ================= PROFILE =================
    const profile = await profileService.getOneByMultiField({
      businessId: businessid,
    });
    if (!profile) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Business not found.");
    }

    const { minWords, maxWords, perRequestCredit } = profile;
    const previousCredits = profile.remainingCredits;

    // ================= VALIDATION =================
    if (previousCredits < perRequestCredit) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, "Insufficient credits.");
    }

    // ================= SUBSCRIPTION =================
    const subscription = await customerSubscriptionService.getOneByMultiField({
      customerId: profile.userId,
      planStatus: planStatusEnum.active,
      isActive: true,
      isDeleted: false,
    });
    if (!subscription) {
      throw new ApiError(400, "No active subscription found.");
    }

    let selectedReview = null;
    let reviewId = null;
    let actionType = "";
    let description = "";

    // =====================================================
    // CASE 1: DB REUSE
    // =====================================================
    let matchQuery = {
      profileId: new mongoose.Types.ObjectId(profile._id),
      isUsed: false,
    };
    if (req.body.service !== "") {
      matchQuery.serviceName = req.body.service;
    }
    if (req.body.product !== "") {
      matchQuery.productName = req.body.product;
    }
    if (req.body.writerGender !== "" && req.body.writerGender !== undefined) {
      matchQuery.writerGender = req.body.writerGender;
    }
    if (req.body.language !== "") {
      matchQuery.language = req.body.language;
    }

    const existingReviews = await reviewsService.findAllWithQuery(matchQuery);

    if (existingReviews.length) {
      const reviewDoc =
        existingReviews[Math.floor(Math.random() * existingReviews.length)];

      const remainingProfileCredits = await deductCredits({
        profile,
        subscription,
        perRequestCredit,
      });

      await reviewsService.getOneAndUpdate(
        { _id: reviewDoc._id },
        {
          isUsed: true,
          usedAtTime: moment().format("YYYY-MM-DD HH:mm:ss"),
        },
      );

      selectedReview = { review: reviewDoc.reviewsText };
      reviewId = reviewDoc._id;

      actionType = "REVIEW_REUSE";
      description = "Used existing review";

      profile.remainingCredits = remainingProfileCredits;
    }

    // =====================================================
    // CASE 2 & 3: AI â†’ FALLBACK
    // =====================================================
    else {
      let aiReviews = [];

      // ---------- TRY AI ----------
      try {
        const prompt = buildPrompt({
          businessName: profile.businessDisplayName,
          businessDescription:
            profile.businessDescription !== ""
              ? profile.businessDescription
              : profile.subCategoryName,
          ownerName:
            req.body.ownerName !== ""
              ? req.body.ownerName
              : profile.owner?.[0]?.name,
          ownerGender:
            req.body.ownerGender !== ""
              ? req.body.ownerGender
              : profile.owner?.[0]?.gender,
          ownerDescription: profile?.[0]?.ownerDescription || "",
          service: req.body.service || "",
          product: req.body.product || "",
          keywords: profile.seoKeywords?.join(", ") || "",
          city: profile.address,
          areas: profile.address?.localLocationAliases?.join(", "),
          languages:
            req.body.language !== "" ? req.body.language : profile.languages,
          minWords,
          maxWords,
          rating: req.body.rating,
          writerGender: req.body.writerGender,
          tag: req.body.tag !== "" ? req.body.tag : "",
        });

        aiReviews = await generateByAI({ prompt });
      } catch (err) {
        console.log("AI ERROR:", err.message);
      }

      // ================= AI SUCCESS =================
      if (aiReviews?.length) {
        // SAVE ALL REVIEWS (ONLY AI)
        const docs = aiReviews.map((r) => ({
          userId: profile.userId,
          profileId: profile._id,
          reviewsText: r.review,
          serviceName: req.body.service,
          productName: req.body.product,
          ownerName: req.body.ownerName || "",
          language: req.body.language,
          writerGender: req.body.writerGender,
          isUsed: false,
          usedAtTime: "",
        }));

        const insertedReviews = await reviewsService.createMany(docs);

        // PICK RANDOM
        const selectedDoc =
          insertedReviews[Math.floor(Math.random() * insertedReviews.length)];

        // MARK USED
        await reviewsService.getOneAndUpdate(
          { _id: selectedDoc._id },
          {
            isUsed: true,
            usedAtTime: moment().format("YYYY-MM-DD HH:mm:ss"),
          },
        );

        const remainingProfileCredits = await deductCredits({
          profile,
          subscription,
          perRequestCredit,
        });

        selectedReview = {
          review: selectedDoc.reviewsText,
          rating: selectedDoc.rating || req.body.rating || 5,
        };

        reviewId = selectedDoc._id;
        actionType = "REVIEW_GENERATE";
        description = "Generated AI reviews";

        profile.remainingCredits = remainingProfileCredits;
      }

      // ================= FALLBACK (NO DB SAVE) =================
      else {
        const templateData =
          await reviewTemplateService.generateReviewTemplates(
            businessid,
            req.body.language,
            req.body,
          );

        const picked =
          templateData.reviews[
            Math.floor(Math.random() * templateData.reviews.length)
          ];

        const remainingProfileCredits = await deductCredits({
          profile,
          subscription,
          perRequestCredit,
        });

        selectedReview = { review: picked };
        reviewId = null; //no DB entry

        actionType = "REVIEW_FALLBACK_DB";
        description = "AI failed â†’ template used";

        profile.remainingCredits = remainingProfileCredits;
      }
    }

    // =====================================================
    // CREDIT LOG
    // =====================================================
    await creditLogService.create({
      profileId: profile._id,
      userId: profile.userId,
      subscriptionId: subscription._id,
      previousCredits,
      deductedCredits: perRequestCredit,
      remainingCredits: profile.remainingCredits,
      actionType,
      reviewId,
      description,
    });

    // ================= PRODUCTS =================
    const products = await productService.findAllWithQuery(
      {
        businessId: businessid,
        isDeleted: false,
        isActive: true,
      },
      { productName: 1 },
    );

    // ================= SERVICES =================
    const services = await serviceFile.findAllWithQuery(
      {
        businessId: businessid,
        isDeleted: false,
        isActive: true,
      },
      { serviceName: 1 },
    );

    const activeOwners = profile.owner?.filter((i) => i.isActive) || [];
    const activeStaff = profile.staff?.filter((i) => i.isActive) || [];

    // ================= RESPONSE =================
    return res.status(200).json({
      message: "Review generated successfully.",
      businessName: profile.businessDisplayName,
      googleBusinessLink: profile.googleBusinessLink,
      ownerLabel: profile.ownerLabel,
      reviews: [selectedReview],
      deductedCredits: perRequestCredit,
      remainingCredits: profile.remainingCredits,
      owner: activeOwners,
      staff: activeStaff,
      languages: profile.languages,
      businessAliases: profile.businessAliases,
      seoKeywords: profile.seoKeywords,
      products,
      services,
      success: true,
      code: "OK",
      issue: null,
    });
  } catch (err) {
    console.log(err);
    const errData = errorRes(err);
    logger.info(errData.resData);
    const { message, status, data, code, issue } = errData.resData;
    return res.status(errData.statusCode).send({
      message,
      status,
      data,
      code,
      issue,
    });
  }
};


