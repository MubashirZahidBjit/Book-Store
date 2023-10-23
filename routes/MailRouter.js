const express = require("express");
const routes = express();
const { sendResponse } = require("../util/common");
const data = require("../data/homepage");
const transporter = require("../database/mail");
const HTTP_STATUS = require("../constants/statusCodes");
const AuthController = require("../controller/AuthController");

routes.post("/send", AuthController.sendForgotPasswordEmail);
routes.post("/reset-password", AuthController.resetPassword);

module.exports = routes;
