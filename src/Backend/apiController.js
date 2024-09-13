const mongoose = require("mongoose");
const GridFSBucket = require("mongodb").GridFSBucket;
const Folder = require("./models/Folder");
const { connectToDb } = require("./common");
// Updated getFolderStructure method
// Updated getFolderStructure method
exports.getFolderStructure = async (req, res) => {
  try {
    const db = await connectToDb();

    // Find the root folder (assuming there's only one root folder)
    const rootFolder = await Folder.findOne({ parent: null })
      .select("-__v")
      .exec();

    if (!rootFolder) {
      return res.status(404).json({ message: "No folder structure found" });
    }

    // Recursively build the folder tree starting from the root folder
    const folderTree = await buildFolderTree(rootFolder);

    res.status(200).json(folderTree);
  } catch (error) {
    console.error("Error fetching folder structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to recursively build folder tree
const buildFolderTree = async (folder) => {
  const cleanedFolder = folder.toObject();

  // Safeguard: Ensure files is an array
  cleanedFolder.files = cleanedFolder.files || [];

  // Map files with contentId
  cleanedFolder.files = cleanedFolder.files.map((file) => ({
    file_id: file.file_id,
    name: file.name,
    contentId: file.contentId,
  }));

  // Check if folder has children
  if (folder.children && folder.children.length > 0) {
    // Recursively fetch and populate child folders
    const childFolders = await Folder.find({ _id: { $in: folder.children } })
      .select("-__v")
      .exec();

    // Recursively build the folder tree for each child
    cleanedFolder.children = await Promise.all(
      childFolders.map(async (child) => await buildFolderTree(child))
    );
  } else {
    cleanedFolder.children = [];
  }

  return cleanedFolder;
};

exports.saveFolderStructure = async (req, res) => {
  try {
    const db = await connectToDb();

    // Delete existing folder structure
    await Folder.deleteMany({});
    console.log("Deleted old folder structure");

    // Save the root folder structure
    const savedFolder = await saveFolderRecursive(req.body, db);
    console.log("Folder structure saved successfully");

    res.status(201).send({
      message: "Folder structure saved successfully!",
      folder: savedFolder,
    });
  } catch (error) {
    console.error("Error saving folder structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const saveFolderRecursive = async (node, db) => {
  const bucket = new GridFSBucket(db);

  // Handle files in the folder
  const files = await Promise.all(
    (node.files || []).map(async (file) => {
      let contentId = null;

      if (file.content) {
        const uploadStream = bucket.openUploadStream(file.name);
        uploadStream.end(Buffer.from(file.content, "utf-8"));
        contentId = uploadStream.id; // Save the contentId
        console.log(contentId);
      }

      return {
        file_id: file.file_id,
        name: file.name,
        contentId: contentId, // Include contentId in the saved file
      };
    })
  );

  // Create and save the folder
  const folder = new Folder({
    file_id: node.file_id,
    name: node.name,
    files: files,
    children: [], // Initialize children as an empty array
  });

  const savedFolder = await folder.save();

  // Recursively save child folders if they exist
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const savedChild = await saveFolderRecursive(child, db);
      savedFolder.children.push(savedChild._id); // Push child folder _id
    }
    await savedFolder.save(); // Save parent folder again with updated children
  }

  return savedFolder; // Return the folder, including children _id references
};

// Retrieve the contents of a file by its `contentId`
// Method to retrieve file content based on file_id
exports.getFileContent = async (req, res) => {
  try {
    const { file_id } = req.query;
    const db = await connectToDb();

    // Find the file with the given file_id in the folder structure
    const folder = await Folder.findOne({ "files.file_id": file_id });

    if (!folder) {
      return res.status(404).json({ message: "File not found" });
    }

    // Find the file object inside the folder
    const file = folder.files.find((f) => f.file_id === file_id);

    if (!file || !file.contentId) {
      return res.status(404).json({ message: "File content not found" });
    }

    const bucket = new GridFSBucket(db);

    // Stream the file content from GridFS
    const downloadStream = bucket.openDownloadStream(file.contentId);

    let fileData = "";
    downloadStream.on("data", (chunk) => {
      fileData += chunk;
    });

    downloadStream.on("end", () => {
      res.status(200).send({ content: fileData });
    });

    downloadStream.on("error", (err) => {
      console.error("Error reading file content:", err);
      res.status(500).json({ message: "Error retrieving file content" });
    });
  } catch (error) {
    console.error("Error fetching file content:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Create a new file/sub-folder in an existing folder
exports.createFileOrFolder = async (req, res) => {
  try {
    const { parent_id, name, isFile, content } = req.body;
    const db = await connectToDb();
    const bucket = new GridFSBucket(db);

    // Find the parent folder
    const parentFolder = await Folder.findOne({ file_id: parent_id });

    if (!parentFolder) {
      return res.status(404).json({ message: "Parent folder not found" });
    }

    let newItem;
    if (isFile) {
      let contentId = null;
      if (content) {
        const uploadStream = bucket.openUploadStream(name);
        uploadStream.end(Buffer.from(content, "utf-8"));
        contentId = uploadStream.id;
      }

      // Create the new file
      newItem = { file_id: new mongoose.Types.ObjectId(), name, contentId };
      parentFolder.files.push(newItem);
    } else {
      // Create the new sub-folder
      newItem = new Folder({
        file_id: new mongoose.Types.ObjectId(),
        name,
        files: [],
        children: [],
      });
      await newItem.save();

      // Add to the parent's children
      parentFolder.children.push(newItem._id);
    }

    await parentFolder.save();
    res.status(201).json({
      message: `${isFile ? "File" : "Folder"} created successfully`,
      item: newItem,
    });
  } catch (error) {
    console.error("Error creating file/folder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update the name or contents of a file/sub-folder
exports.updateFileOrFolder = async (req, res) => {
  try {
    const { file_id, name, content } = req.body;
    const db = await connectToDb();
    const bucket = new GridFSBucket(db);

    // Find the file or folder
    const folder = await Folder.findOne({ "files.file_id": file_id });

    if (!folder) {
      return res.status(404).json({ message: "Item not found" });
    }

    const file = folder.files.find((f) => f.file_id.toString() === file_id);

    if (file) {
      // Update file name and/or content
      if (name) file.name = name;

      if (content) {
        if (file.contentId) {
          // Delete old content from GridFS
          await bucket.delete(new mongoose.Types.ObjectId(file.contentId));
        }

        const uploadStream = bucket.openUploadStream(name || file.name);
        uploadStream.end(Buffer.from(content, "utf-8"));
        file.contentId = uploadStream.id;
      }

      await folder.save();
      res.status(200).json({ message: "File updated successfully" });
    } else {
      res.status(404).json({ message: "File not found" });
    }
  } catch (error) {
    console.error("Error updating file/folder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a file/sub-folder
exports.deleteFileOrFolder = async (req, res) => {
  try {
    const { file_id } = req.query;
    console.log(file_id);
    const db = await connectToDb();
    const bucket = new GridFSBucket(db);

    // Find and delete file or folder
    const folder = await Folder.findOneAndUpdate(
      { "files.file_id": file_id },
      { $pull: { files: { file_id } } }
    );

    if (folder) {
      const file = folder.files.find((f) => f.file_id.toString() === file_id);
      if (file && file.contentId) {
        await bucket.delete(new mongoose.Types.ObjectId(file.contentId));
      }
      await folder.save();
      return res.status(200).json({ message: "File deleted successfully" });
    } else {
      res.status(404).json({ message: "File/Folder not found" });
    }
  } catch (error) {
    console.error("Error deleting file/folder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Getting tables and columns
exports.getTableAndColumnNames = async (req, res) => {
  try {
    const dbName = req.params.dbName;
    const db = mongoose.connection.useDb(dbName);
    const collections = await db.db.listCollections().toArray();

    const result = await Promise.all(
      collections
        .filter(
          (col) =>
            col.name !== "folders" &&
            col.name !== "fs.chunks" &&
            col.name !== "fs.files"
        ) // Exclude "folders" collection
        .map(async (collection) => {
          const collectionInfo = await db.collection(collection.name).findOne();
          if (collectionInfo) {
            const columns = Object.keys(collectionInfo).filter(
              (column) => column !== "_id" && column !== "InsertedDateTime"
            );
            return {
              tableName: collection.name,
              columns: columns,
            };
          } else {
            return {
              tableName: collection.name,
              columns: [],
            };
          }
        })
    );

    res.json(result);
  } catch (error) {
    common.handleError(res, error);
  }
};

exports.getColumnValuesByTimeInterval = async (req, res) => {
  try {
    const { dbName, collectionName, columns, startTime, endTime } = req.body;
    const db = mongoose.connection.useDb(dbName);

    // Convert startTime and endTime to ISO string format
    const startTimeStr = new Date(startTime).toISOString();
    const endTimeStr = endTime ? new Date(endTime).toISOString() : null;

    // Build the query object based on the presence of endTime
    let query;
    if (endTimeStr) {
      // Case 1: endTime is provided
      query = {
        InsertedDateTime: {
          $gte: startTimeStr,
          $lte: endTimeStr,
        },
      };
    } else {
      // Case 2: endTime is not provided
      query = {
        InsertedDateTime: {
          $gte: startTimeStr,
        },
      };
    }

    // Create projection object
    const projection = columns.reduce(
      (proj, col) => ({ ...proj, [col]: 1 }),
      {}
    );
    // Include InsertedDateTime and exclude _id from the projection
    projection.InsertedDateTime = 1;
    projection._id = 0;

    console.log("Query:", JSON.stringify(query));
    console.log("Projection:", JSON.stringify(projection));

    // Find documents without applying projection to debug
    const rawResult = await db.collection(collectionName).find(query).toArray();
    console.log("Raw Result:", rawResult);

    // Apply projection and find documents
    const result = await db
      .collection(collectionName)
      .find(query)
      .project(projection)
      .toArray();
    console.log("Result:", result);

    res.json(result);
  } catch (error) {
    common.handleError(res, error);
  }
};
