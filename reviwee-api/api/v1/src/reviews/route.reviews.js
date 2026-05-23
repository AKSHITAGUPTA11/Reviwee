const router = require("express").Router();
const reviewsController = require("./controller.reviews");
const validate = require("../../middleware/validate");
const reviewsValidation = require("./validation.reviews");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(reviewsValidation.getAllFilter),
  reviewsController.allFilterPagination,
);

// /**
//  * select review
//  */
// router.post("/select-review", reviewsController.selectReview);

/**
 * get document
 */
router.get("/", authCheckMiddleware, reviewsController.get);

/**
 * get document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(reviewsValidation.getById),
  reviewsController.getById,
);

module.exports = router;
