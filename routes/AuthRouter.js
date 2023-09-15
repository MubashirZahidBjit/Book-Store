const express = require("express");
const router = express.Router();
// const UserController = require("../controller/UserController");
const AuthController = require("../controller/AuthController");
// const { validateEmailAndPassword } = require("../middleware/validation");
// const { validateAuthorization } = require("../middleware/auth");

router.post("/api/signUp", AuthController.signUp);
router.post("/api/logIn", AuthController.logIn);

module.exports = router;
