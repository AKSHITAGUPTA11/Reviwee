const router = require("express").Router();
const invoiceController = require("./controller.invoice");
const validate = require("../../middleware/validate");
const invoiceValidation = require("./validation.invoice");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */
router.post(
  "/",
  validate(invoiceValidation.getAllFilter),
  invoiceController.allFilterPagination,
);

/**
 *update gst details
 */
router.put(
  "/update-gst-details",
  authCheckMiddleware,
  validate(invoiceValidation.getUpdateGstDetails),
  invoiceController.updateGstDetails,
);

/**
 * get document
 */
router.get("/", authCheckMiddleware, invoiceController.get);

module.exports = router;
