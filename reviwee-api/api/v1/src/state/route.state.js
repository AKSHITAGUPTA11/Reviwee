const router = require("express").Router();
const serviceController = require("./controller.state");

/**
 * get document
 */
router.get("/", serviceController.get);

module.exports = router;
