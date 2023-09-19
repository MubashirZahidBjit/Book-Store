const express = require("express");
const router = express.Router();
const CartController = require("../controller/CartController");
const { isUser } = require("../middleware/authValidation");

// Add a new cart
router.post("/api/addToCart", isUser, CartController.addToCart);

// Remove from cart
router.delete("/api/removeFromCart", isUser, CartController.removeFromCart);

// View Books
router.get("/api/viewBooks", isUser, CartController.viewBooks);

module.exports = router;
