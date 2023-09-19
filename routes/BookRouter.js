const express = require("express");
const router = express.Router();
const BookController = require("../controller/Books");
const { isAdmin } = require("../middleware/authValidation");

// Create a new book
router.post("/api/create", isAdmin, BookController.createBook);

// Get all books
router.get("/api/getAll", BookController.getAllBooks);

// Update a book by ID
router.put("/api/update/:id", isAdmin, BookController.updateBook);

// Delete a book by ID
router.delete("/api/delete/:id", isAdmin, BookController.deleteBook);

module.exports = router;
