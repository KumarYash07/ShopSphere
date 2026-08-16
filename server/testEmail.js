import dotenv from "dotenv";
dotenv.config();

import { sendOTPEmail } from "./services/emailService.js";

const testEmail = async () => {
  try {
    await sendOTPEmail(
      "gamingasus40@gmail.com",
      "123456"
    );

    console.log("Test email sent successfully!");
  } catch (error) {
    console.error("Test failed:", error.message);
  }
};

testEmail();