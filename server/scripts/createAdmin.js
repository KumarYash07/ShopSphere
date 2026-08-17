import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db.js";
import User from "../models/User.js";

const createAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL.toLowerCase(),
    });

    if (existingAdmin) {
      console.log("Admin already exists.");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      12
    );

    const admin = await User.create({
      firstName: "ShopSphere",
      lastName: "Admin",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      phone: '9999999999',
      password: hashedPassword,
      role: "admin",
      authProvider: "local",
      isEmailVerified: true,
      status: "active",
    });

    console.log("Admin created successfully!");
    console.log("Admin Email:", admin.email);
    console.log("Role:", admin.role);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Admin creation failed:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

createAdmin();