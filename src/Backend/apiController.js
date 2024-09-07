const mongoose = require("mongoose");
const GridFSBucket = require("mongodb").GridFSBucket;
const Folder = require("./models/Folder");
const { connectToDb } = require("./common");

// Get folder structure
exports.getFolderStructure = async (req, res) => {
  try {
    const db = await connectToDb();

    // Fetch the root folder (assuming only one root folder exists)
    const rootFolder = await Folder.findOne({ parent: null })
      .select("-__v")
      .exec();

    if (!rootFolder) {
      return res.status(404).json({ message: "No folder structure found" });
    }

    // Build the folder tree starting from the root
    const folderTree = await buildFolderTree(rootFolder);

    res.status(200).json(folderTree);
  } catch (error) {
    console.error("Error fetching folder structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper to recursively build folder tree
const buildFolderTree = async (folder) => {
  try {
    const cleanedFolder = folder.toObject();
    cleanedFolder.files = cleanedFolder.files || [];

    // Map files with contentId
    cleanedFolder.files = cleanedFolder.files.map((file) => ({
      file_id: file.file_id,
      name: file.name,
      contentId: file.contentId,
    }));

    if (folder.children && folder.children.length > 0) {
      const childFolders = await Folder.find({ _id: { $in: folder.children } })
        .select("-__v")
        .exec();

      cleanedFolder.children = await Promise.all(
        childFolders.map(async (child) => await buildFolderTree(child))
      );
    } else {
      cleanedFolder.children = [];
    }

    return cleanedFolder;
  } catch (error) {
    console.error("Error building folder tree:", error);
    throw new Error("Failed to build folder tree");
  }
};

// Save folder structure
exports.saveFolderStructure = async (req, res) => {
  try {
    const db = await connectToDb();

    // Delete existing folder structure
    await Folder.deleteMany({});
    console.log("Deleted old folder structure");

    // Save new folder structure
    const savedFolder = await saveFolderRecursive(req.body, db);
    console.log("Folder structure saved successfully");

    res.status(201).json({
      message: "Folder structure saved successfully!",
      folder: savedFolder,
    });
  } catch (error) {
    console.error("Error saving folder structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper to save folder structure recursively
const saveFolderRecursive = async (node, db) => {
  try {
    const bucket = new GridFSBucket(db);

    const files = await Promise.all(
      (node.files || []).map(async (file) => {
        let contentId = null;

        if (file.content) {
          const uploadStream = bucket.openUploadStream(file.name);
          uploadStream.end(Buffer.from(file.content, "utf-8"));
          contentId = uploadStream.id;
        }

        return {
          file_id: file.file_id,
          name: file.name,
        };
      })
    );

    const folder = new Folder({
      file_id: node.file_id,
      name: node.name,
      files,
      children: [],
    });

    const savedFolder = await folder.save();

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const savedChild = await saveFolderRecursive(child, db);
        savedFolder.children.push(savedChild._id);
      }
      await savedFolder.save();
    }

    return savedFolder;
  } catch (error) {
    console.error("Error saving folder recursively:", error);
    throw new Error("Failed to save folder recursively");
  }
};

// Update folder or file
exports.updateFolderOrFile = async (req, res) => {
  try {
    const { file_id, name, content } = req.body;

    let folder = await Folder.findOne({ "files.file_id": file_id });

    if (folder) {
      let file = folder.files.id(file_id);
      if (name) file.name = name;

      if (content) {
        const db = mongoose.connection.db;
        const bucket = new GridFSBucket(db);
        const uploadStream = bucket.openUploadStream(file.name);
        uploadStream.end(Buffer.from(content, "utf-8"));
        file.contentId = uploadStream.id;
      }

      await folder.save();
    } else {
      folder = await Folder.findOne({ file_id });
      if (folder && name) {
        folder.name = name;
        await folder.save();
      }
    }

    res.status(200).json({ message: "Update successful!" });
  } catch (error) {
    console.error("Error updating folder/file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete folder or file
exports.deleteFolderOrFile = async (req, res) => {
  try {
    const { file_id } = req.params;

    const folder = await Folder.findOneAndDelete({ file_id });
    if (folder) {
      return res.status(200).json({ message: "Folder deleted successfully!" });
    }

    const parentFolder = await Folder.findOne({ "files.file_id": file_id });
    if (parentFolder) {
      parentFolder.files.id(file_id).remove();
      await parentFolder.save();
      return res.status(200).json({ message: "File deleted successfully!" });
    }

    res.status(404).json({ message: "File/Folder not found!" });
  } catch (error) {
    console.error("Error deleting folder/file:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get table and column names
exports.getTableAndColumnNames = async (req, res) => {
  try {
    const dbName = req.params.dbName;
    const db = mongoose.connection.useDb(dbName);
    const collections = await db.db.listCollections().toArray();

    const result = await Promise.all(
      collections
        .filter(
          (col) => !["folders", "fs.chunks", "fs.files"].includes(col.name)
        ) // Exclude "folders" collection
        .map(async (collection) => {
          const collectionInfo = await db.collection(collection.name).findOne();
          const columns = collectionInfo
            ? Object.keys(collectionInfo).filter(
                (column) => !["_id", "InsertedDateTime"].includes(column)
              )
            : [];
          return {
            tableName: collection.name,
            columns,
          };
        })
    );

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching table and column names:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get column values by time interval
exports.getColumnValuesByTimeInterval = async (req, res) => {
  try {
    const { dbName, collectionName, columns, startTime, endTime } = req.body;
    const db = mongoose.connection.useDb(dbName);

    const query = {
      InsertedDateTime: {
        $gte: new Date(startTime).toISOString(),
        ...(endTime ? { $lte: new Date(endTime).toISOString() } : {}),
      },
    };

    const projection = columns.reduce((proj, col) => ({ ...proj, [col]: 1 }), {
      InsertedDateTime: 1,
      _id: 0,
    });

    console.log("Query:", JSON.stringify(query));
    console.log("Projection:", JSON.stringify(projection));

    const result = await db
      .collection(collectionName)
      .find(query)
      .project(projection)
      .toArray();

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching column values:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
