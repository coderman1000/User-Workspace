const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");

// File schema to store metadata
const fileSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  contentId: { type: mongoose.Schema.Types.ObjectId }, // GridFS file ID
});

const folderSchema = new mongoose.Schema({
  file_id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  files: [fileSchema],
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Folder" }], // Reference to child folders
});

const Folder = mongoose.model("Folder", folderSchema);

module.exports = Folder;
