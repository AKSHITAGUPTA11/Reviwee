const router = require("express").Router();
const productController = require("./controller.product");
const validate = require("../../middleware/validate");
const productValidation = require("./validation.product");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(productValidation.getAllFilter),
  productController.allFilterPagination,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(productValidation.create),
  productController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(productValidation.get),
  productController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.getById),
  productController.getById,
);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.update),
  productController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(productValidation.changeStatus),
  productController.statusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(productValidation.deleteDocument),
  productController.deleteDocument,
);

module.exports = router;
