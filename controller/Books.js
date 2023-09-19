const Book = require("../model/Books");
const { success, failure } = require("../util/common");
const HTTP_STATUS = require("../constants/statusCodes");

// Create a new book
// const createBook = async (req, res) => {
//   try {
//     const {
//       title,
//       price,
//       author,
//       stock,
//       description,
//       discounted_price,
//       release_date,
//     } = req.body;

//     // Check if a book with the same title already exists
//     const existingBook = await Book.findOne({ title });
//     if (existingBook) {
//       return res
//         .status(HTTP_STATUS.BAD_REQUEST)
//         .json(failure("A book with the same title already exists."));
//     }

//     // Create a new book instance
//     const newBook = new Book({
//       title,
//       price,
//       author,
//       stock,
//       description,
//       discounted_price,
//       release_date,
//     });

//     // Save the book to the database
//     await newBook.save();

//     return res
//       .status(HTTP_STATUS.CREATED)
//       .json(success("Book created successfully", newBook));
//   } catch (error) {
//     return res
//       .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
//       .json(failure("An error occurred while creating the book", error));
//   }
// };

const createBook = async (req, res) => {
  try {
    const {
      title,
      price,
      author,
      stock,
      description,
      discounted_price,
      release_date,
      discount_start_date,
      discount_end_date,
    } = req.body;

    // Check if a book with the same title already exists
    const existingBook = await Book.findOne({ title });
    if (existingBook) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json(failure("A book with the same title already exists."));
    }

    // Create a new book instance
    const newBook = new Book({
      title,
      price,
      author,
      stock,
      description,
      discounted_price,
      release_date,
      discount_start_date,
      discount_end_date,
    });

    // Save the book to the database
    await newBook.save();

    return res
      .status(HTTP_STATUS.CREATED)
      .json(success("Book created successfully", newBook));
  } catch (error) {
    return res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while creating the book", error));
  }
};

// Get all books with search, sort, filter, and pagination
const getAllBooks = async (req, res) => {
  try {
    const {
      title,
      author,
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      sortBy,
      sortOrder,
      page,
      pageSize,
    } = req.query;

    // Create a filter object based on query parameters
    const filter = {};
    if (title) filter.title = { $regex: title, $options: "i" };
    if (author) filter.author = { $regex: author, $options: "i" };
    if (minPrice) filter.price = { $gte: parseFloat(minPrice) };
    if (maxPrice)
      filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (minStock) filter.stock = { $gte: parseInt(minStock) };
    if (maxStock) filter.stock = { ...filter.stock, $lte: parseInt(maxStock) };

    // Create a sort object based on query parameters
    const sort = {};
    if (sortBy) sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Calculate skip and limit for pagination
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // Query the database with the filter, sort, skip, and limit
    const books = await Book.find(filter).sort(sort).skip(skip).limit(limit);

    res
      .status(HTTP_STATUS.OK)
      .json(success("Books retrieved successfully", books));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while fetching books", error));
  }
};
// Update a book by ID
const updateBook = async (req, res) => {
  try {
    const { id } = req.params; // Extract the book ID from the request parameters
    const updateData = req.body; // Extract the update data from the request body

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    console.log(id);

    if (!updatedBook) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Book not found with the given ID"));
    }

    res
      .status(HTTP_STATUS.OK)
      .json(success("Book updated successfully", updatedBook));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while updating the book", error));
  }
};

// Delete a book by ID
const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the book using findByIdAndRemove
    const deletedBook = await Book.findByIdAndRemove(id);

    if (!deletedBook) {
      return res
        .status(HTTP_STATUS.NOT_FOUND)
        .json(failure("Book not found with the given ID"));
    }

    res
      .status(HTTP_STATUS.OK)
      .json(success("Book deleted successfully", deletedBook));
  } catch (error) {
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json(failure("An error occurred while deleting the book", error));
  }
};

module.exports = {
  createBook,
  getAllBooks,
  updateBook,
  deleteBook,
};
