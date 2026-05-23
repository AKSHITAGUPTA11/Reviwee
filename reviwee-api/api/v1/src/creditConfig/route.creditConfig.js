const router = require("express").Router();
const creditConfigController = require("./controller.creditConfig");
const validate = require("../../middleware/validate");
const creditConfigValidation = require("./validation.creditConfig");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(creditConfigValidation.getAllFilter),
  creditConfigController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(creditConfigValidation.create),
  creditConfigController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(creditConfigValidation.get),
  creditConfigController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(creditConfigValidation.getById),
  creditConfigController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(creditConfigValidation.update),
  creditConfigController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(creditConfigValidation.changeStatus),
  creditConfigController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(creditConfigValidation.deleteDocument),
  creditConfigController.deleteDocument,
);

module.exports = router;
