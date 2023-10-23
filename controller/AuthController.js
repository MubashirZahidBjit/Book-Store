const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jasonwebtoken = require("jsonwebtoken");
const { default: mongoose } = require("mongoose");
const path = require("path");
const ejs = require("ejs");
const transporter = require("../database/mail");
const { promisify } = require("util");
const ejsRenderFile = promisify(ejs.renderFile);
const crypto = require("crypto");
// const { sendResponse } = require("../util/common");

class AuthController {
  async signUp(req, res) {
    try {
      // Check for validation errors
      const validation = validationResult(req).array();
      console.log(validation);
      if (validation.length > 0) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Failed to add user", validation));
      }
      // Extract email and password from request body
      const { name, email, phone, address, role, balance, password } = req.body;

      // Check if the email is already registered
      const existingUser = await Auth.findOne({ email });
      if (existingUser) {
        return res
          .status(HTTP_STATUS.CONFLICT)
          .send(failure("Email already registered"));
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);
      // Create and save a new Auth document with email and hashed password
      const result = await Auth.create({
        name: name,
        email: email,
        password: hashedPassword,
        role: role,
      });

      //   await result.save();

      // Create a new User document and save it in the users collection
      const newUser = await User.create({
        name: name,
        email: email,
        phone: phone,
        address: address,
        role: role,
        balance: balance,
      });

      //   await newUser.save();

      return res
        .status(HTTP_STATUS.CREATED)
        .send(success("User registered successfully", result));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async logIn(req, res) {
    const { email, password } = req.body;
    console.log(email, password);

    const auth = await Auth.findOne({ email: email });

    if (!auth) {
      return res.status(HTTP_STATUS.OK).send(failure("User is not registerd"));
    }
    const checkPassword = await bcrypt.compare(password, auth.password);
    console.log(checkPassword);
    if (!checkPassword) {
      return res.status(HTTP_STATUS.OK).send(failure("Invalid Credentials"));
    }
    const user = await User.findOne({ email: email });
    const responseAuth = auth.toObject();
    delete responseAuth.password;
    delete responseAuth._id;

    // const userId = String(user._id);
    responseAuth.id = user._id;
    // console.log(responseAuth.id);
    const jwt = jasonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    responseAuth.token = jwt;

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully Logged in", responseAuth));
  }

  async sendForgotPasswordEmail(req, res) {
    try {
      const { recipient } = req.body;
      if (!recipient || recipient === "") {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Recipient email is not provided"));
      }

      const auth = await Auth.findOne({ email: recipient });

      if (!auth) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("User is not registerd"));
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      auth.resetPasswordToken = resetToken;
      auth.resetPasswordExpire = Date.now() + 60 * 60 * 1000;
      auth.resetPassword = true;

      await auth.save();

      const resetURL = path.join(
        process.env.FRONTEND_URL,
        "reset-password",
        resetToken,
        auth._id.toString()
      );
      const htmlBody = await ejsRenderFile(
        path.join(__dirname, "..", "views", "forgot-password.ejs"),
        {
          name: auth.name,
          resetURL: resetURL,
        }
      );

      const result = await transporter.sendMail({
        from: "zahid-app.com",
        to: `${auth.name} ${recipient}`,
        subject: "Forgot Password?",
        html: htmlBody,
      });

      if (result.messageId) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully requesting for resetting password"));
      }
      return res.status(HTTP_STATUS.OK).send(failure("Something went wrong"));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Something went wrong"));
    }
  }

  async resetPassword(req, res) {
    try {
      const { token, userId, newPassword, confirmPassword } = req.body;

      const auth = await Auth.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      if (!auth) {
        return res.status(HTTP_STATUS.OK).send(failure("Invalid Request"));
      }

      if (auth.resetPasswordExpire < Date.now()) {
        return res.status(HTTP_STATUS.GONE).send(failure("Expire time"));
      }

      if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
        return res
          .status(HTTP_STATUS.UNAUTHORIZED)
          .send(failure("Invalid Token"));
      }

      if (newPassword !== confirmPassword) {
        return res
          .status(HTTP_STATUS.OK)
          .send(failure("Password do not match"));
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10).then((hash) => {
        return hash;
      });

      const result = await Auth.findByIdAndUpdate(
        { _id: new mongoose.Types.ObjectId(userId) },
        {
          password: hashedPassword,
          resetPassword: false,
          resetPasswordExpire: null,
          resetPasswordToken: null,
        }
      );

      if (result.isModified) {
        return res
          .status(HTTP_STATUS.OK)
          .send(success("Successfully updated the password"));
      }
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Something went wrong"));
    }
    // return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
  }

  async validatePasswordResetRequest(req, res) {
    try {
      const { token, userId } = req.body;

      const auth = await Auth.findOne({
        _id: new mongoose.Types.ObjectId(userId),
      });
      if (!auth) {
        return sendResponse(res, HTTP_STATUS.NOT_FOUND, "Invalid request");
      }

      if (auth.resetPasswordExpire < Date.now()) {
        return sendResponse(res, HTTP_STATUS.GONE, "Expired request");
      }

      if (auth.resetPasswordToken !== token || auth.resetPassword === false) {
        return sendResponse(res, HTTP_STATUS.UNAUTHORIZED, "Invalid token");
      }
      return sendResponse(res, HTTP_STATUS.OK, "Request is still valid");
    } catch (error) {
      console.log(error);
      return sendResponse(
        res,
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "Something went wrong!"
      );
    }
  }
}

module.exports = new AuthController();
