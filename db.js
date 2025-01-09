const mongoose = require("mongoose");

const connectToMongo = async () => {
  try {
    const uri = "mongodb://127.0.0.1:27017/iNotebook"; // Use IPv4 explicitly
    await mongoose.connect(uri); // No need for additional options
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectToMongo;
