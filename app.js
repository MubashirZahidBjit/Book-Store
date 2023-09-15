const express = require("express");
const app = express();
const cors = require("cors");
const BookRouter = require("./routes/BookRouter");
const AuthRouter = require("./routes/AuthRouter");
const UserRouter = require("./routes/UserRouter");

const dotenv = require("dotenv");
const databaseConnection = require("./database/database");

dotenv.config();

app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/books", BookRouter);
app.use("/auth", AuthRouter);
app.use("/user", UserRouter);

app.use((req, res) => {
  return res.status(400).send({ message: "Invalid Request" });
});

databaseConnection(() => {
  app.listen(8000, () => {
    console.log("Server is running on port 8000");
  });
});
