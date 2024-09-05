exports.handleError = (res, error) => {
  console.error(error);
  res
    .status(500)
    .json({ message: "Internal Server Error", error: error.message });
};
const { MongoClient } = require("mongodb");

let dbInstance = null;

const connectToDb = async () => {
  if (!dbInstance) {
    try {
      const client = await MongoClient.connect(
        "mongodb://localhost:27017/ABC",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      dbInstance = client.db("ABC");
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw new Error("Database connection failed: " + error.message);
    }
  }
  return dbInstance;
};

module.exports = { connectToDb };
