const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discounted_price: {
    type: Number,
    default: null,
  },
  release_date: {
    type: Number,
    required: true,
  },
});

const Book = mongoose.model("Book", bookSchema);

module.exports = Book;
