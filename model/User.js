const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  role: {
    type: Number, // 1 = admin, 2 = regular
    required: false,
    default: 2,
  },
  balance: {
    type: Number,
    required: false,
  },
});

const User = mongoose.model("User", userSchema);
module.exports = User;
