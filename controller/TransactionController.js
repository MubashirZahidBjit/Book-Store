const Cart = require("../model/Cart");
const User = require("../model/User");
const Book = require("../model/Books");
const Transaction = require("../model/Transaction");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class TransactionController {
  async addToTransaction(req, res) {
    try {
      // Extract userId from the request body
      const { userId } = req.body;

      // Find the user's cart
      const cart = await Cart.findOne({ user: userId }).populate("books.book");

      if (!cart) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Cart not found"));
      }

      // Calculate the total price from the cart
      const totalPrice = cart.totalPrice;

      // Find the user's balance
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Check if the user's balance is greater than or equal to the total price
      if (user.balance < totalPrice) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Insufficient balance"));
      }

      // Create a new transaction document
      const transactionProducts = [];

      for (const cartItem of cart.books) {
        const { book, quantity } = cartItem;

        // Find the book details
        const bookDetails = await Book.findById(book._id);

        if (!bookDetails) {
          return res
            .status(HTTP_STATUS.NOT_FOUND)
            .send(failure("Book details not found"));
        }

        // Check if the quantity is smaller than the book's stock
        if (quantity > bookDetails.stock) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .send(failure(`Insufficient stock for ${bookDetails.title}`));
        }

        // Deduct the book's stock
        bookDetails.stock -= quantity;
        await bookDetails.save();

        // Add the product to the transaction
        transactionProducts.push({
          id: bookDetails._id,
          quantity: quantity,
          stock: bookDetails.stock,
        });
      }

      // Create a new transaction document
      const transaction = new Transaction({
        user: userId,
        books: transactionProducts,
        balance: user.balance - totalPrice,
      });

      // Save the transaction document
      await transaction.save();

      // Deduct the user's balance
      user.balance -= totalPrice;
      await user.save();

      // Delete the cart
      await Cart.deleteOne({ _id: cart._id });

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Transaction completed successfully"));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new TransactionController();
