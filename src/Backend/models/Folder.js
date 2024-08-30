const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true }, // Unique file ID
  name: { type: String, required: true },
  content: { type: String }, // Save file content here
});

const folderSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true }, // Unique folder ID
  name: { type: String, required: true },
  files: [fileSchema],
  children: [{ type: String, ref: "Folder" }], // Referencing child folders by file_id
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
