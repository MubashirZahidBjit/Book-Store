const express = require("express");
const router = express.Router();
const ReviewController = require("../controller/ReviewController");
const { isAdmin, isUser } = require("../middleware/authValidation");

// Add a new review
router.post("/api/addReview", isUser, ReviewController.addReview);
router.delete("/api/removeReview", isUser, ReviewController.removeReview);
router.put("/api/updateReview", isUser, ReviewController.updateReview);

module.exports = router;
