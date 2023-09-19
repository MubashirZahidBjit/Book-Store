const express = require("express");
const router = express.Router();
const ReviewController = require("../controller/ReviewController");

// Add a new transaction
router.post("/api/addReview", ReviewController.addReview);
router.delete("/api/removeReview", ReviewController.removeReview);
router.put("/api/updateReview", ReviewController.updateReview);

module.exports = router;
