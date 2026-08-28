export const adminOnly = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized. Please login.",
            });
        }

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Admin access required.",
            });
        }

        next();
    } catch (error) {
        console.error("Admin Middleware Error:", error);

        return res.status(500).json({
            success: false,
            message: "Authorization failed.",
        });
    }
};