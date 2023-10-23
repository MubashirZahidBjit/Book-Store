const path = require("path");
const fileTypes = require("../constants/fileTypes");
const HTTP_STATUS = require("../constants/statusCodes");
const { sendResponse, success, failure } = require("../util/common");
const fs = require("fs");

// res.status(HTTP_STATUS.NOT_FOUND).send(failure(err.message));
// res
//       .status(HTTP_STATUS.OK)
//       .send(success("Successfully Logged in", responseAuth));

class FileController {
  async uploadFile(req, res, next) {
    try {
      if (!fileTypes.includes(req.file_extension)) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Only .jpg, .png, .jpeg, .txt, .pdf"));
      }

      if (!req.file) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("Failed to upload file"));
      }

      return res
        .status(HTTP_STATUS.OK)
        .send(success(" Successfully uploaded file"));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }

  async getFile(req, res, next) {
    try {
      const { filepath } = req.params;
      const exists = fs.existsSync(
        path.join(__dirname, "..", "server", filepath)
      );

      if (!exists) {
        return res
          .status(HTTP_STATUS.NOT_FOUND)
          .send(failure("File not found"));
      }
      return res
        .status(200)
        .sendFile(path.join(__dirname, "..", "server", filepath));
    } catch (error) {
      console.log(error);
      return res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .send(failure("Internal server error"));
    }
  }
}

module.exports = new FileController();
