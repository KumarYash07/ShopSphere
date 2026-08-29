import mongoose from "mongoose";
import User from "../models/User.js";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(process.env.MONGO_URI);

    await User.syncIndexes();

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error(
      "MongoDB Connection Failed:",
      error.message
    );

    throw error;
  }
};

export default connectDB;