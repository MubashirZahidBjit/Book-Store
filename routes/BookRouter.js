const express = require("express");
const router = express.Router();
const BookController = require("../controller/Books");
const { isAdmin } = require("../middleware/authValidation");
const upload = require("../database/files");

// Create a new book
router.post("/api/create", upload.single("image"), BookController.createBook); //isAdmin

// Get all books
router.get("/api/getAll", BookController.getAllBooks);

// Update a book by ID
router.put("/api/update/:id", isAdmin, BookController.updateBook);

// Delete a book by ID
router.delete("/api/delete/:id", isAdmin, BookController.deleteBook);

module.exports = router;
