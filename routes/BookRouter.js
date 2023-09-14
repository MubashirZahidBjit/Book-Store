const express = require("express");
const router = express.Router();
const BookController = require("../controller/Books");

// Create a new book
router.post("/api/create", BookController.createBook);

// Get all books
router.get("/api/getAll", BookController.getAllBooks);

// Update a book by ID
router.put("/api/update/:id", BookController.updateBook);

// Delete a book by ID
router.delete("/api/delete/:id", BookController.deleteBook);

module.exports = router;
