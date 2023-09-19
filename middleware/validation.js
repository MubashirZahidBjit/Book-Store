const { body } = require("express-validator");

// Defining validation rules for email and password
const validateEmailAndPassword = {
  signUp: [
    body("email")
      .isEmail()
      .withMessage("Invalid email address")
      .bail()
      .notEmpty()
      .withMessage("Email is required"),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .notEmpty()
      .withMessage("Password is required")
      .bail()
      .isStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      })
      .withMessage("Strong Password is required"),
  ],
};
module.exports = {
  validateEmailAndPassword,
};
