import bcrypt from "bcryptjs";

import User from "../models/User.js";
import EmailOTP from "../models/EmailOTP.js";

import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../services/emailService.js";

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
    } = req.body;

    // 1. Required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields are required",
      });
    }

    // 2. Validate role
    const allowedRoles = ["user", "host"];

    const userRole = role || "user";

    if (!allowedRoles.includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check existing email
    const existingEmail = await User.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: "Email already registered",
      });
    }

    // 4. Check existing phone
    const existingPhone = await User.findOne({
      phone,
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number already registered",
      });
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Host requires admin approval
    const accountStatus =
      userRole === "host" ? "pending" : "active";

    // 7. Create user
    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      phone,
      password: hashedPassword,
      role: userRole,
      authProvider: "local",
      status: accountStatus,
      isEmailVerified: false,
    });

    // 8. Generate OTP
    const otp = generateOTP();

    // 9. Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 10. Remove any old OTP for this email
    await EmailOTP.deleteMany({
      email: normalizedEmail,
    });

    // 11. Save OTP
    await EmailOTP.create({
      email: normalizedEmail,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 12. Send OTP
    await sendOTPEmail(normalizedEmail, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. OTP sent to your email.",
      email: normalizedEmail,
      userId: user._id,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};


export const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 3. Already verified?
    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // 4. Find OTP
    const emailOTP = await EmailOTP.findOne({
      email: normalizedEmail,
    });

    if (!emailOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // 5. Check expiry
    if (emailOTP.expiresAt < new Date()) {
      await EmailOTP.deleteOne({
        _id: emailOTP._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 6. Limit attempts
    if (emailOTP.attempts >= 5) {
      await EmailOTP.deleteOne({
        _id: emailOTP._id,
      });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // 7. Compare OTP
    const isOTPValid = await bcrypt.compare(
      otp.toString(),
      emailOTP.otpHash
    );

    if (!isOTPValid) {
      emailOTP.attempts += 1;
      await emailOTP.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // 8. Verify email
    user.isEmailVerified = true;
    await user.save();

    // 9. Delete OTP
    await EmailOTP.deleteOne({
      _id: emailOTP._id,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification",
    });
  }
};