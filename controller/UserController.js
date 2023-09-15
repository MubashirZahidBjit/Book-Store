const User = require("../model/User");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { name, email, phone, address, role, balance } = req.body;

    // Create a new user instance
    const newUser = new User({
      name,
      email,
      phone,
      address,
      role,
      balance,
    });

    // Save the user to the database
    await newUser.save();

    res
      .status(HTTP_STATUS.CREATED)
      .json(success("User created successfully", newUser));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while creating the user", error));
  }
};

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res
      .status(HTTP_STATUS.OK)
      .json(success("Users retrieved successfully", users));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while fetching users", error));
  }
};

module.exports = {
  createUser,
  getAllUsers,
};
