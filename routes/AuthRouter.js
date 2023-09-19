const express = require("express");
const router = express.Router();
// const UserController = require("../controller/UserController");
const AuthController = require("../controller/AuthController");
const validation = require("../middleware/validation");

router.post(
  "/api/signUp",
  validation.validateEmailAndPassword.signUp,
  AuthController.signUp
);
router.post("/api/logIn", AuthController.logIn);

module.exports = router;
