const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const HTTP_STATUS = require("./constants/statusCodes");

const BookRouter = require("./routes/BookRouter");
const AuthRouter = require("./routes/AuthRouter");
const UserRouter = require("./routes/UserRouter");
const CartRouter = require("./routes/CartRouter");
const TransactionRouter = require("./routes/TransactionRouter");
const ReviewRouter = require("./routes/ReviewRouter");
const MailRouter = require("./routes/MailRouter");
const FileRouter = require("./routes/FileRouter");

const dotenv = require("dotenv");
const databaseConnection = require("./database/database");

dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

// Log file
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "server", "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use((err, req, res, next) => {
  console.log(err);
  if (err instanceof multer.MulterError) {
    return res.status(HTTP_STATUS.NOT_FOUND).send(failure(err.message));
  } else {
    next(err);
  }
});

app.use("/books", BookRouter);
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);
app.use("/cart", CartRouter);
app.use("/transaction", TransactionRouter);
app.use("/review", ReviewRouter);
app.use("/mail", MailRouter);
app.use("/file", FileRouter);

app.use((req, res) => {
  return res.status(400).send({ message: "Invalid Request" });
});

databaseConnection(() => {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
});
