const router = require("express").Router();
const languageController = require("./controller.language");
const validate = require("../../middleware/validate");
const languageValidation = require("./validation.language");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(languageValidation.getAllFilter),
  languageController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(languageValidation.create),
  languageController.add,
);

/**
 * get document
 */
router.get("/", languageController.get);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.getById),
  languageController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.update),
  languageController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(languageValidation.changeStatus),
  languageController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(languageValidation.deleteDocument),
  languageController.deleteDocument,
);

module.exports = router;
