const Review = require("../model/Review");
const Transaction = require("../model/Transaction");
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
      const existingReview = await Review.findOne({
        user: userId,
        book: bookId,
      });

      if (existingReview) {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("You have already reviewed this book."));
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

  async removeReview(req, res) {
    try {
      // Extract userId, bookId, and removeType from the request body
      const { userId, bookId, removeType } = req.body;

      // Find the review
      const review = await Review.findOne({ user: userId, book: bookId });

      if (!review) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Review not found"));
      }

      // Check the removeType and perform the corresponding action
      if (removeType === "rating") {
        // Remove only the rating
        review.rating = undefined;
      } else if (removeType === "review") {
        // Remove only the review text
        review.review = undefined;
      } else if (removeType === "all") {
        // Remove the entire document
        await Review.deleteOne({ _id: review._id });
        return res.status(HTTP_STATUS.OK).send(success("Review removed"));
      } else {
        return res
          .status(HTTP_STATUS.BAD_REQUEST)
          .send(failure("Invalid removeType"));
      }

      // Save the updated review (removing rating or review)
      await review.save();

      return res.status(HTTP_STATUS.OK).send(success("Review updated", review));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async updateReview(req, res) {
    try {
      // Extract userId, bookId, updatedRating, and updatedReview from the request body
      const { userId, bookId, updatedRating, updatedReview } = req.body;

      // Find the review
      const review = await Review.findOne({ user: userId, book: bookId });

      if (!review) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Review not found"));
      }

      // Update the rating and/or review if provided in the request
      if (updatedRating !== undefined) {
        review.rating = updatedRating;
      }

      if (updatedReview !== undefined) {
        review.review = updatedReview;
      }

      // Save the updated review
      await review.save();

      return res.status(HTTP_STATUS.OK).send(success("Review updated", review));
    } catch (error) {
      console.error(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new ReviewController();
