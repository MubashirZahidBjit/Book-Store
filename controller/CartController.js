const Cart = require("../model/Cart");
const User = require("../model/User");
const Book = require("../model/Books");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class CartController {
  // async addToCart(req, res) {
  //   try {
  //     // Extract userId, bookId, and quantity from the request body
  //     const { userId, bookId, quantity } = req.body;

  //     // Check if the user exists
  //     const user = await User.findById(userId);
  //     if (!user) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .send(failure("User not found"));
  //     }

  //     // Check if the book exists
  //     const book = await Book.findById(bookId);
  //     if (!book) {
  //       return res
  //         .status(HTTP_STATUS.NOT_FOUND)
  //         .send(failure("Book not found"));
  //     }

  //     // Calculate the total price based on book price and quantity
  //     const totalPrice = (book.price * quantity).toFixed(2);

  //     // Create a new cart item object
  //     const cartItem = {
  //       book: bookId,
  //       quantity: quantity,
  //     };

  //     // Check if the user already has a cart or create a new one
  //     let cart = await Cart.findOne({ user: userId });
  //     if (!cart) {
  //       cart = new Cart({
  //         user: userId,
  //         books: [cartItem],
  //         totalPrice: totalPrice,
  //       });
  //     } else {
  //       // Check if the book already exists in the cart
  //       const existingCartItem = cart.books.find((item) =>
  //         item.book.equals(bookId)
  //       );

  //       if (existingCartItem) {
  //         // If the book already exists, update the quantity and total price
  //         existingCartItem.quantity += quantity;
  //         cart.totalPrice = (
  //           parseFloat(cart.totalPrice) + parseFloat(totalPrice)
  //         ).toFixed(2);
  //       } else {
  //         // If the book doesn't exist, add it to the cart
  //         cart.books.push(cartItem);
  //         cart.totalPrice = (
  //           parseFloat(cart.totalPrice) + parseFloat(totalPrice)
  //         ).toFixed(2);
  //       }
  //     }

  //     // Save the updated cart
  //     await cart.save();

  //     return res
  //       .status(HTTP_STATUS.OK)
  //       .send(success("Book added to cart successfully", cart));
  //   } catch (error) {
  //     console.error(error);
  //     return res
  //       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
  //       .send(failure("Internal server error"));
  //   }
  // }

  async addToCart(req, res) {
    try {
      // Extract userId, bookId, and quantity from the request body
      const { userId, bookId, quantity } = req.body;

      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Check if the book exists
      const book = await Book.findById(bookId);
      if (!book) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Book not found"));
      }

      // Calculate the total price based on the regular book price and quantity
      let totalPrice = (book.price * quantity).toFixed(2);

      // Calculate the current time
      const currentTime = new Date();
      console.log(currentTime);

      // Check if the current time is within the discounted price time range
      const discountStartDate = new Date(book.discount_start_date);
      const discountEndDate = new Date(book.discount_end_date);

      if (currentTime >= discountStartDate && currentTime <= discountEndDate) {
        // If within the time range, use the discounted price
        totalPrice = (book.discounted_price * quantity).toFixed(2);
      }

      // Create a new cart item object
      const cartItem = {
        book: bookId,
        quantity: quantity,
      };

      // Check if the user already has a cart or create a new one
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({
          user: userId,
          books: [cartItem],
          totalPrice: totalPrice,
        });
      } else {
        //  if the book already exists in the cart
        const existingCartItem = cart.books.find((item) =>
          item.book.equals(bookId)
        );

        if (existingCartItem) {
          // If the book already exists, update the quantity and total price
          existingCartItem.quantity += quantity;
          cart.totalPrice = (
            parseFloat(cart.totalPrice) + parseFloat(totalPrice)
          ).toFixed(2);
        } else {
          // If the book doesn't exist, add it to the cart
          cart.books.push(cartItem);
          cart.totalPrice = (
            parseFloat(cart.totalPrice) + parseFloat(totalPrice)
          ).toFixed(2);
        }
      }

      // Save the updated cart
      await cart.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Book added to cart successfully", cart));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async removeFromCart(req, res) {
    try {
      // Extract userId, bookId, and quantityToRemove from the request body
      const { userId, bookId, quantityToRemove } = req.body;

      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Check if the cart exists for the user
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Cart not found"));
      }

      // Find the index of the book to be removed in the cart's books array
      const bookIndex = cart.books.findIndex((item) =>
        item.book.equals(bookId)
      );

      if (bookIndex === -1) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Book not found in cart"));
      }

      // Get the current quantity and price of the book in the cart
      const { quantity } = cart.books[bookIndex];
      const book = await Book.findById(bookId);
      const bookPrice = book ? book.price : 0;

      // Calculate the total price to deduct based on the quantity to remove
      const totalPriceDeduct = (bookPrice * quantityToRemove).toFixed(2);

      // Check if the requested quantity to remove exceeds the current quantity
      if (quantityToRemove > quantity) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Invalid quantity to remove"));
      }

      // If the requested quantity to remove equals the current quantity, remove the book from the cart
      if (quantityToRemove === quantity) {
        cart.books[bookIndex].quantity -= quantityToRemove;
        cart.totalPrice = (
          parseFloat(cart.totalPrice) - parseFloat(totalPriceDeduct)
        ).toFixed(2);
        cart.books.splice(bookIndex, 1);
      } else {
        // Update the quantity and total price for the book in the cart
        cart.books[bookIndex].quantity -= quantityToRemove;
        cart.totalPrice = (
          parseFloat(cart.totalPrice) - parseFloat(totalPriceDeduct)
        ).toFixed(2);
      }

      // Save the updated cart
      await cart.save();

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Book removed from cart successfully", cart));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async viewBooks(req, res) {
    try {
      // Extract userId from the request body
      const { userId } = req.body;

      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("User not found"));
      }

      // Find the user's cart and populate the books field with book details
      const cart = await Cart.findOne({ user: userId }).populate(
        "books.book",
        "title price"
      );

      if (!cart) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Cart not found"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Cart books retrieved successfully", cart.books));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new CartController();
