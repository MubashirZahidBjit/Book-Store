const express = require("express");
const router = express.Router();
const TransactionController = require("../controller/TransactionController");
const { isAdmin, isUser } = require("../middleware/authValidation");

// Add a new transaction
router.post(
  "/api/addToTransaction",
  isUser,
  TransactionController.addToTransaction
);

// Get All Transactions
router.get(
  "/api/viewAllTransactions",
  isAdmin,
  TransactionController.viewAllTransactions
);

module.exports = router;
