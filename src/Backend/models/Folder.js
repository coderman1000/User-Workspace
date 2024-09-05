const mongoose = require("mongoose");
const { Schema } = mongoose;

const folderSchema = new Schema({
  file_id: { type: String, required: true },
  name: { type: String, required: true },
  files: [
    {
      file_id: { type: String, required: true },
      name: { type: String, required: true },
      contentId: { type: mongoose.Types.ObjectId }, // Reference to GridFS
    },
  ],
  children: [{ type: mongoose.Types.ObjectId, ref: "Folder" }],
});

const Folder = mongoose.model("Folder", folderSchema);
module.exports = Folder;
