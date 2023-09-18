const express = require("express");
const router = express.Router();
const ReviewController = require("../controller/ReviewController");

// Add a new transaction
router.post("/api/addReview", ReviewController.addReview);

module.exports = router;
