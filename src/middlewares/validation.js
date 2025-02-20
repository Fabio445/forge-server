const { validationResult, body } = require("express-validator");

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateUser = [
  body("username").isLength({ min: 1 }).withMessage("Username is required"),
  body("email").isEmail().withMessage("Email is required"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

const validateLogin = [
  body("username").isLength({ min: 1 }).withMessage("Username is required"),
  body("password").isLength({ min: 8 }).withMessage("Password is required"),
];

const validateTask = [
  body("title").isLength({ min: 1 }).withMessage("Title is required"),
  body("description")
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("completed").isBoolean().withMessage("Completed must be a boolean"),
];

module.exports = {
  validate,
  validationResult,
  validateUser,
  validateLogin,
  validateTask,
};
