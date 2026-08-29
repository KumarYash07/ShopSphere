import app from "../server/app.js";
import connectDB from "../server/config/db.js";

export default async function handler(req, res) {
    try {
        await connectDB();

        return app(req, res);
    } catch (error) {
        console.error("Vercel API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}