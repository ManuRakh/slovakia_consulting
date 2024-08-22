const express = require("express");
const PositionController = require("./positionController");
const {
  validateOpenPosition,
  validateClosePosition,
} = require("../middlewares/validationMiddleware");

const router = express.Router();
const positionController = new PositionController();

router.post(
  "/positions/open",
  validateOpenPosition,
  positionController.openPosition
);
router.post(
  "/positions/close",
  validateClosePosition,
  positionController.closePosition
);

module.exports = router;
