const Review = require("../model/Review");
const Transaction = require("../model/Transaction");
const Book = require("../model/Books"); // Import the Book model
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

class ReviewController {
  async addReview(req, res) {
    try {
      // Extract userId, bookId, rating, and review from the request body
      const { userId, bookId, rating, review } = req.body;

      // Check if the user has previously bought (transactioned) the book
      const transaction = await Transaction.findOne({
        user: userId,
        "books.id": bookId,
      });

      if (!transaction) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("You can only review books you have bought."));
      }

      // Check if the user has already reviewed the book
      let existingReview = await Review.findOne({ user: userId, book: bookId });

      if (existingReview) {
        // If the user has already reviewed the book, update the rating and review
        existingReview.rating = rating;
        existingReview.review = review;

        // Save the updated review
        existingReview = await existingReview.save();

        // Populate the book details in the existingReview
        await existingReview.populate("book");

        return res
          .status(HTTP_STATUS.OK)
          .send(success("Review updated successfully", existingReview));
      }

      // Create a new review document
      const newReview = new Review({
        user: userId,
        book: bookId,
        rating: rating,
        review: review,
      });

      // Save the new review
      await newReview.save();

      // Populate the book details in the newReview
      await newReview.populate("book");

      return res
        .status(HTTP_STATUS.OK)
        .send(success("Review added successfully", newReview));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new ReviewController();
