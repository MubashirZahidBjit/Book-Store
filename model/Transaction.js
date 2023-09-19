const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    books: {
      type: [
        {
          id: { type: mongoose.Types.ObjectId, ref: "Book" },
          quantity: Number,
          stock: Number,
        },
      ],
      required: true,
    },
    total_price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// userSchema.index({ id: Number });

const Transaction = mongoose.model("Transaction", transactionSchema);
module.exports = Transaction;
