import "dotenv/config";

import cloudinary from "./config/cloudinary.js";

const testCloudinary = async () => {
  try {
    const result = await cloudinary.api.ping();

    console.log("Cloudinary connection successful!");
    console.log(result);

    process.exit(0);
  } catch (error) {
    console.error("Cloudinary connection failed!");
    console.error(error.message);

    process.exit(1);
  }
};

testCloudinary();