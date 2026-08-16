import nodemailer from "nodemailer";

export const sendOTPEmail = async (email, otp) => {
  try {
    // Create transporter only when function is called
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"ShopSphere" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "ShopSphere - Email Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        ">

          <h2 style="text-align: center;">
            Welcome to ShopSphere
          </h2>

          <p>Your email verification OTP is:</p>

          <div style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            text-align: center;
            margin: 30px 0;
          ">
            ${otp}
          </div>

          <p>
            This OTP is valid for <strong>5 minutes</strong>.
          </p>

          <p>
            If you did not create a ShopSphere account,
            you can safely ignore this email.
          </p>

          <hr>

          <p style="font-size: 12px; color: #777;">
            This is an automated email. Please do not reply.
          </p>

        </div>
      `,
    });

    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    console.error("Email sending failed:", error.message);
    throw new Error("Unable to send OTP email");
  }
};