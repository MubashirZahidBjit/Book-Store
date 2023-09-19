const jsonwebtoken = require("jsonwebtoken");
const HTTP_STATUS = require("../constants/statusCodes");
const { failure } = require("../util/common");
const express = require("express");

const isUser = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
    const jwt = req.headers.authorization.split(" ")[1];
    const validate = jsonwebtoken.decode(jwt, process.env.SECRET_KEY);
    if (validate && validate.role === 2) {
      next();
    } else {
      return res.status(403).send(failure("Access denied."));
    }
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Invalid"));
    }
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Expired"));
    }
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Token expired"));
  }
};
const isAdmin = (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Unauthorized access"));
    }
    const jwt = req.headers.authorization.split(" ")[1];
    const validate = jsonwebtoken.decode(jwt, process.env.SECRET_KEY);
    if (validate && validate.role === 1) {
      next();
    } else {
      return res
        .status(403)
        .send(failure("Access denied. User is not an admin"));
    }
  } catch (error) {
    if (error instanceof jsonwebtoken.JsonWebTokenError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Invalid"));
    }
    if (error instanceof jsonwebtoken.TokenExpiredError) {
      return res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .send(failure("Token Expired"));
    }
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .send(failure("Token expired"));
  }
};

module.exports = { isUser, isAdmin };
