const bcrypt = require("bcrypt");
const Auth = require("../model/Auth");
const User = require("../model/User");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");
const jasonwebtoken = require("jsonwebtoken");

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

    const auth = await Auth.findOne({ email: email });

    if (!auth) {
      return res.status(HTTP_STATUS.OK).send(failure("User is not registerd"));
    }
    const checkPassword = await bcrypt.compare(password, auth.password);
    console.log(checkPassword);
    if (!checkPassword) {
      return res.status(HTTP_STATUS.OK).send(failure("Invalid Credentials"));
    }

    const responseAuth = auth.toObject();
    delete responseAuth.password;
    delete responseAuth._id;

    const jwt = jasonwebtoken.sign(responseAuth, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    responseAuth.token = jwt;

    return res
      .status(HTTP_STATUS.OK)
      .send(success("Successfully Logged in", responseAuth));
  }
}

module.exports = new AuthController();
