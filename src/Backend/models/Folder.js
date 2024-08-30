const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String }, // Save file content here
});

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  files: [fileSchema],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }],
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
