const express = require("express");
const router = express.Router();
const UserController = require("../controller/UserController");

// Create a new user
router.post("/api/create", UserController.createUser);

// Get all users
router.get("/api/getAllUsers", UserController.getAllUsers);

module.exports = router;
