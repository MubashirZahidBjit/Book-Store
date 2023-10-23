const express = require("express");
const routes = express();
const upload = require("../database/files");
const FileController = require("../controller/FileController");
const { MulterError } = require("multer");
// const { sendResponse } = require("../util/common");

routes.post("/upload-file", upload.single("image"), FileController.uploadFile);
routes.get("/get/:filepath", FileController.getFile);

module.exports = routes;
