const express = require("express");
const router = express.Router();
const TransactionController = require("../controller/TransactionController");

// Add a new transaction
router.post("/api/addToTransaction", TransactionController.addToTransaction);

module.exports = router;
