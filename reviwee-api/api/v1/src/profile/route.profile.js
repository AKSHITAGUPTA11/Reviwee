const router = require("express").Router();
const profileController = require("./controller.profile");
const validate = require("../../middleware/validate");
const profileValidation = require("./validation.profile");
const { authCheckMiddleware } = require("../../middleware/authenticationCheck");

//-----------------------------------------------------

/**
 * get all user pagination filter
 */

router.post(
  "/",
  authCheckMiddleware,
  validate(profileValidation.getAllFilter),
  profileController.allFilterPagination,
);

/**
 * get all user pagination filter
 */

router.post(
  "/credit-logs",
  authCheckMiddleware,
  validate(profileValidation.getAllFilter),
  profileController.getCreditLogs,
);

/**
 * create new document
 */
router.post(
  "/add",
  authCheckMiddleware,
  validate(profileValidation.create),
  profileController.add,
);

/**
 * get document
 */
router.get(
  "/",
  authCheckMiddleware,
  validate(profileValidation.get),
  profileController.get,
);

/**
 * delete document
 */
router.get(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.getById),
  profileController.getById,
);

/**
 * delete document
 */
router.get(
  "/place-id/:id",
  authCheckMiddleware,
  profileController.getBusinessDescriptionByPlaceId,
);

/**
 * delete document
 */
router.get("/public/:id", profileController.getByBusinessId);

/**
 * update document
 */
router.put(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.update),
  profileController.update,
);

/**
 * update status
 */
router.put(
  "/status-change/:id",
  authCheckMiddleware,
  validate(profileValidation.changeStatus),
  profileController.statusChange,
);

/**
 * update member status
 */
router.put(
  "/member-status-change/:id",
  authCheckMiddleware,
  validate(profileValidation.memberStatusChange),
  profileController.memberStatusChange,
);

/**
 * delete document
 */
router.delete(
  "/:id",
  authCheckMiddleware,
  validate(profileValidation.deleteDocument),
  profileController.deleteDocument,
);

module.exports = router;
