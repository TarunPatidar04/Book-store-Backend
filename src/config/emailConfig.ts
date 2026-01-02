import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(
      "Gmail services is not to send the emails. Please check the email configurations"
    );
  } else {
    console.log("Server is ready to send emails");
  }
});

const sendEmail = async (to: string, subject: string, body: string) => {
  await transporter.sendMail({
    from: `Your BookKart Team ${process.env.EMAIL_USER}`,
    to,
    subject,
    html: body,
  });
};

export const sendVerificationEmail = async (to: string, token: string) => {
  const VerificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  const html = `
 <h1>Welcome to BookKart ! Verify Your Email</h1>
 <h2>Thank you for registering with BookKart</h2>
 <p>Click on the link below to verify your email</p>
 <a href=${VerificationUrl}>Verify Email Here...!</a>
 <p>Thank you for using BookKart</p>
 
 `;
  await sendEmail(to, "Please Verify Your Email to Access Your BookKart", html);
};

export const sendResetPasswordLinkToEmail = async (
  to: string,
  token: string
) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  const html = `
 <h1>Welcome to BookKart</h1>
 <h2>You Have requested to reset your Password.Click the Link Below to set a new Password</h2>
 <p>Click on the link below to reset your password</p>
 <a href=${resetUrl}>Reset Password Here...!</a>
 <p>Thank you for using BookKart</p>
 
 `;
  await sendEmail(to, "Please Reset Your Password to Access Your BookKart", html);
};
