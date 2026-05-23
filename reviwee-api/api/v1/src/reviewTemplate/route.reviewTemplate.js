const router = require("express").Router();
const reviewTemplateController = require("./controller.reviewTemplate");
const validate = require("../../middleware/validate");
const reviewTemplateValidation = require("./validation.reviewTemplate");

// Public route (QR scan)
router.post(
  "/generate/:businessid",
  validate(reviewTemplateValidation.create),
  reviewTemplateController.getReviewTemplates,
);

module.exports = router;
