const express = require("express");
const router = express.Router();
const CartController = require("../controller/CartController");

// Add a new cart
router.post("/api/addToCart", CartController.addToCart);

// Remove from cart
router.delete("/api/removeFromCart", CartController.removeFromCart);

// View Books
router.get("/api/viewBooks", CartController.viewBooks);

module.exports = router;
