const mongoose = require("mongoose");
const path = require('path');

require("dotenv").config({ path: path.resolve(__dirname, '../.env')}); // Load environment variables

const MONGO_URI = process.env.MONGO_URI; // Get from .env

const connectDatabase = async () => {
  try {
    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined in .env");
    }

    if (mongoose.connection.readyState === 1) {
      console.log("Already connected to MongoDB");
      return;
    }

    await mongoose.connect(MONGO_URI); // No deprecated options

    console.log("Database connected successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1); // Exit on failure
  }
};

module.exports = connectDatabase;
