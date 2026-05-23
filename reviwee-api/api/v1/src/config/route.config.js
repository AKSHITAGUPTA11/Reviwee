const router = require("express").Router();
const configController = require("./controller.config");
const validate = require("../../middleware/validate");
const configValidation = require("./validation.config");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  validate(configValidation.getAllFilter),
  configController.allFilterPagination,
);

/**
 * get document
 */
router.get("/", configController.get);

module.exports = router;
