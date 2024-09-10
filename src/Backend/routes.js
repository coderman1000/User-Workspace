const express = require("express");
const router = express.Router();
const apiController = require("./apiController");

router.post("/saveFolderStructure", apiController.saveFolderStructure);
router.get("/getFolderStructure", apiController.getFolderStructure);
router.get("/getFileContent", apiController.getFileContent);
router.put("/updateFileOrFolder", apiController.updateFileOrFolder);
router.delete("/deleteFileOrFolder", apiController.deleteFileOrFolder);
router.post("/createFileOrFolder", apiController.createFileOrFolder);

router.get("/tables/:dbName", apiController.getTableAndColumnNames);
router.post("/columns/values", apiController.getColumnValuesByTimeInterval);

module.exports = router;
