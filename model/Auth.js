const mongoose = require("mongoose");

const authSchema = new mongoose.Schema({
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
    required: false,
  },
  address: {
    type: String,
    required: false,
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
  password: {
    type: String,
    required: true,
  },
});

const AuthModel = mongoose.model("Auth", authSchema);

module.exports = AuthModel;
