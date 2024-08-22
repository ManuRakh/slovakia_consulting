const { body, validationResult } = require("express-validator");

const validateOpenPosition = [
  body("amount_sol")
    .isDecimal()
    .withMessage("Amount of tokens must be a decimal number"),
  body("position_type")
    .isString()
    .withMessage("Position type must be a string"),

  body("asset_id").isUUID().withMessage("Asset ID must be a valid UUID"),
  body("user_id").isUUID().withMessage("User ID must be a valid UUID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

const validateClosePosition = [
  body("amount_sol")
    .isDecimal()
    .withMessage("Amount of tokens must be a decimal number"),
  body("position_type")
    .isString()
    .withMessage("Position type must be a string"),

  body("asset_id").isUUID().withMessage("Asset ID must be a valid UUID"),
  body("user_id").isUUID().withMessage("User ID must be a valid UUID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = {
  validateOpenPosition,
  validateClosePosition,
};
