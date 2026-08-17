export const adminTest = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome Admin!",
    user: req.user.email,
    role: req.user.role,
  });
};