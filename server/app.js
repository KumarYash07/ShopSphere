import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import storeRoutes from "./routes/storeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopSphere API is running",
  });
});

// Auth routes
app.use("/api/auth", authRoutes);

//User Routes
app.use("/api/users", userRoutes);

//Admin
app.use("/api/admin", adminRoutes);

//store
app.use("/api/stores", storeRoutes);

//category
app.use("/api/categories", categoryRoutes);

export default app;