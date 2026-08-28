import bcrypt from "bcryptjs";

import User from "../models/User.js";
import EmailOTP from "../models/EmailOTP.js";

import { generateOTP } from "../utils/generateOTP.js";
import { sendOTPEmail } from "../services/emailService.js";
import { generateToken } from "../utils/generateToken.js";

//Register
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


//Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 3. Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in",
      });
    }

    // 4. Check account status
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked",
      });
    }

    // 5. Host approval check
    if (user.role === "host" && user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your seller account is awaiting admin approval",
      });
    }

    // 6. Compare password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 7. Generate JWT
    const token = generateToken(user);

    // 8. Response
    return res.status(200).json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};


//login Users
// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        success: false,
        message: "First name, last name and phone are required",
      });
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedFirstName || !trimmedLastName || !trimmedPhone) {
      return res.status(400).json({
        success: false,
        message: "Profile fields cannot be empty",
      });
    }

    // Check whether phone belongs to another user
    const existingPhone = await User.findOne({
      phone: trimmedPhone,
      _id: { $ne: req.user._id },
    });

    if (existingPhone) {
      return res.status(409).json({
        success: false,
        message: "Phone number is already registered",
      });
    }

    // Get current authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update allowed fields only
    user.firstName = trimmedFirstName;
    user.lastName = trimmedLastName;
    user.phone = trimmedPhone;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while updating profile",
    });
  }
};



// Request Email Change OTP
export const requestEmailChange = async (req, res) => {
  try {
    const { newEmail } = req.body;

    // 1. Validate email
    if (!newEmail) {
      return res.status(400).json({
        success: false,
        message: "New email is required",
      });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // 2. Check if new email is same as current email
    if (normalizedEmail === req.user.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: "New email must be different from your current email",
      });
    }

    // 3. Check if email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    // 4. Generate OTP
    const otp = generateOTP();

    // 5. Hash OTP
    const otpHash = await bcrypt.hash(otp, 10);

    // 6. Remove previous OTP for this email
    await EmailOTP.deleteMany({
      email: normalizedEmail,
    });

    // 7. Save OTP
    await EmailOTP.create({
      email: normalizedEmail,
      otpHash,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // 8. Send OTP to NEW email
    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your new email address",
    });
  } catch (error) {
    console.error("Request Email Change Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while requesting email change",
    });
  }
};


// Verify Email Change OTP
export const verifyEmailChange = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;

    // 1. Validate input
    if (!newEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "New email and OTP are required",
      });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    // 2. Check if email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    // 3. Find OTP
    const emailOTP = await EmailOTP.findOne({
      email: normalizedEmail,
    });

    if (!emailOTP) {
      return res.status(400).json({
        success: false,
        message: "OTP not found. Please request a new OTP.",
      });
    }

    // 4. Check expiry
    if (emailOTP.expiresAt < new Date()) {
      await EmailOTP.deleteOne({
        _id: emailOTP._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // 5. Limit attempts
    if (emailOTP.attempts >= 5) {
      await EmailOTP.deleteOne({
        _id: emailOTP._id,
      });

      return res.status(429).json({
        success: false,
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // 6. Compare OTP
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

    // 7. Get current authenticated user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 8. Final duplicate check
    const emailAlreadyUsed = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: user._id },
    });

    if (emailAlreadyUsed) {
      await EmailOTP.deleteOne({
        _id: emailOTP._id,
      });

      return res.status(409).json({
        success: false,
        message: "This email is already registered",
      });
    }

    // 9. Update email
    user.email = normalizedEmail;
    user.isEmailVerified = true;

    await user.save();

    // 10. Delete OTP
    await EmailOTP.deleteOne({
      _id: emailOTP._id,
    });

    return res.status(200).json({
      success: true,
      message: "Email changed and verified successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isEmailVerified: user.isEmailVerified,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Verify Email Change Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying email change",
    });
  }
};