const router = require("express").Router();
const serviceController = require("./controller.service");
const validate = require("../../middleware/validate");
const serviceValidation = require("./validation.service");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(serviceValidation.getAllFilter),
  serviceController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(serviceValidation.create),
  serviceController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(serviceValidation.get),
  serviceController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(serviceValidation.getById),
  serviceController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(serviceValidation.update),
  serviceController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(serviceValidation.changeStatus),
  serviceController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(serviceValidation.deleteDocument),
  serviceController.deleteDocument,
);

module.exports = router;
