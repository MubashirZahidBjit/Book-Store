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

// Update a user by ID
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("User not found with the given ID"));
    }

    res
      .status(HTTP_STATUS.OK)
      .json(success("User updated successfully", updatedUser));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while updating the user", error));
  }
};

// Delete a user by ID
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the user using findByIdAndRemove
    const deletedUser = await User.findByIdAndRemove(id);

    if (!deletedUser) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("User not found with the given ID"));
    }

    res
      .status(HTTP_STATUS.OK)
      .json(success("User deleted successfully", deletedUser));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while deleting the user", error));
  }
};

module.exports = {
  createUser,
  getAllUsers,
  updateUser,
  deleteUser,
};
