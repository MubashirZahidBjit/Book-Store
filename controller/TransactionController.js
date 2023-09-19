const Cart = require("../model/Cart");
const User = require("../model/User");
const Book = require("../model/Books");
const Transaction = require("../model/Transaction");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class TransactionController {
  // async addToTransaction(req, res) {
  //   try {
  //     // Extract userId from the request body
  //     const { userId } = req.body;

  //     // Find the user's cart
  //     const cart = await Cart.findOne({ user: userId }).populate("books.book");

  //     if (!cart) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .send(failure("Cart not found"));
  //     }

  //     // Calculate the total price from the cart
  //     const totalPrice = cart.totalPrice;

  //     // Find the user's balance
  //     const user = await User.findById(userId);

  //     if (!user) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .send(failure("User not found"));
  //     }

  //     // Check if the user's balance is greater than or equal to the total price
  //     if (user.balance < totalPrice) {
  //       return res
  //         .status(HTTP_STATUS.BAD_REQUEST)
  //         .send(failure("Insufficient balance"));
  //     }

  //     // Create a new transaction document
  //     const transactionProducts = [];

  //     for (const cartItem of cart.books) {
  //       const { book, quantity } = cartItem;

  //       // Find the book details
  //       const bookDetails = await Book.findById(book._id);

  //       if (!bookDetails) {
  //         return res
  //           .status(HTTP_STATUS.NOT_FOUND)
  //           .send(failure("Book details not found"));
  //       }

  //       // Check if the quantity is smaller than the book's stock
  //       if (quantity > bookDetails.stock) {
  //         return res
  //           .status(HTTP_STATUS.BAD_REQUEST)
  //           .send(failure(`Insufficient stock for ${bookDetails.title}`));
  //       }

  //       // Deduct the book's stock
  //       bookDetails.stock -= quantity;
  //       await bookDetails.save();

  //       // Add the product to the transaction
  //       transactionProducts.push({
  //         id: bookDetails._id,
  //         quantity: quantity,
  //         stock: bookDetails.stock,
  //       });
  //     }

  //     // Create a new transaction document
  //     const transaction = new Transaction({
  //       user: userId,
  //       books: transactionProducts,
  //       balance: user.balance - totalPrice,
  //     });

  //     // Save the transaction document
  //     await transaction.save();

  //     // Deduct the user's balance
  //     user.balance -= totalPrice;
  //     await user.save();

  //     // Delete the cart
  //     await Cart.deleteOne({ _id: cart._id });

  //     return res
  //       .status(HTTP_STATUS.OK)
  //       .send(success("Transaction completed successfully"));
  //   } catch (error) {
  //     console.error(error);
  //     return res
  //       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //       .send(failure("Internal server error"));
  //   }
  // }

  async addToTransaction(req, res) {
    try {
      // Extract userId from the request body
      const { userId } = req.body;

      // Check if the user exists in the cart collection
      const cart = await Cart.findOne({ user: userId });

      if (!cart) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("User's cart not found. Add books to the cart first."));
      }

      // Get the user's balance
      const user = await User.findById(userId);

      if (!user) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("User not found."));
      }

      // Create a new transaction
      const transaction = new Transaction({
        user: userId,
        books: [],
        total_price: 0,
      });

      // Iterate over the books in the cart and add them to the transaction
      for (const cartItem of cart.books) {
        const bookId = cartItem.book;
        const quantity = cartItem.quantity;

        // Check if the book exists and has sufficient stock
        const book = await Book.findById(bookId);

        if (!book || book.stock < quantity) {
          return res
            .status(HTTP_STATUS.BAD_REQUEST)
            .send(
              failure(
                `Book with ID ${bookId} does not exist or does not have sufficient stock.`
              )
            );
        }

        // Calculate the total price based on the book's price or discounted_price
        const currentTime = new Date();
        const isDiscountTime =
          currentTime >= book.discount_start_date &&
          currentTime <= book.discount_end_date;
        const price = isDiscountTime ? book.discounted_price : book.price;
        const totalPrice = price * quantity;

        // Update the book's stock
        book.stock -= quantity;

        // Add the book to the transaction
        transaction.books.push({
          id: bookId,
          quantity,
          stock: book.stock,
        });

        await book.save();

        // Update the transaction's total price
        transaction.total_price += totalPrice;
      }

      // Check if the user's balance is sufficient for the transaction
      if (user.balance < transaction.total_price) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Insufficient balance. Please top up your balance."));
      }

      // Perform the transaction
      user.balance -= transaction.total_price;
      await user.save();
      await transaction.save();

      // Delete the user's cart after a successful transaction
      await Cart.findOneAndDelete({ user: userId });

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Transaction completed successfully", transaction));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async viewAllTransactions(req, res) {
    try {
      const transactions = await Transaction.find()
        .populate("user", "username email")
        .populate("books.id", "title price");

      return res
        .status(HTTP_STATUS.OK)
        .json(success("Transactions retrieved successfully", transactions));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json(failure("Internal server error"));
    }
  }
}

module.exports = new TransactionController();
