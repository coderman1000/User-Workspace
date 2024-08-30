const mongoose = require("mongoose");
const common = require("./common");
const Folder = require("./models/Folder");
// Helper function to save folders recursively

const saveFolderRecursive = async (node) => {
  console.log(`Attempting to save folder: ${node.name} with ID: ${node.id}`);

  // Create a new folder with its files and children (children will be populated later)
  const folder = new Folder({
    name: node.name,
    files: node.files || [], // assuming files are directly in the node
    children: [], // Will be populated with the _id of child folders
  });

  // Save the folder to get its ID
  const savedFolder = await folder.save();
  console.log(
    `Successfully saved folder: ${savedFolder.name} with ID: ${savedFolder._id}`
  );

  // If the node has children, recursively save them
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const savedChild = await saveFolderRecursive(child);
      savedFolder.children.push(savedChild._id);
    }
    // Update the folder with children references
    await savedFolder.save();
  }

  return savedFolder;
};

exports.saveFolderStructure = async (req, res) => {
  try {
    const folderStructure = req.body;

    // Remove existing folder structure before saving new one
    await Folder.deleteMany({});
    console.log("Deleted old folder structure");

    for (const folder of folderStructure) {
      await saveFolderRecursive(folder);
      console.log(`Folder structure saved successfully`);
    }

    res.status(201).send({ message: "Folder structure saved successfully!" });
  } catch (error) {
    console.error("Error saving folder structure:", error);
    common.handleError(res, error);
  }
};

const populateChildren = async (folder) => {
  const populatedChildren = await Folder.find({
    _id: { $in: folder.children },
  }).populate("children");
  for (let i = 0; i < populatedChildren.length; i++) {
    populatedChildren[i] = await populateChildren(populatedChildren[i]);
  }
  return {
    id: folder._id.toString(),
    name: folder.name,
    files: folder.files,
    children: populatedChildren,
  };
};

exports.getFolderStructure = async (req, res) => {
  try {
    console.log("Fetching folder structure with root ID: root");

    const rootFolder = await Folder.findOne({ name: "Root Folder" }).populate(
      "children"
    );

    if (!rootFolder) {
      console.log("Root folder not found");
      return res.status(404).json({ message: "Folder structure not found" });
    }

    const folderStructure = await populateChildren(rootFolder);
    res.json(folderStructure);
  } catch (error) {
    console.error("Error fetching folder structure:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getTableAndColumnNames = async (req, res) => {
  try {
    const dbName = req.params.dbName;
    const db = mongoose.connection.useDb(dbName);
    const collections = await db.db.listCollections().toArray();

    const result = await Promise.all(
      collections.map(async (collection) => {
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
