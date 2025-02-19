import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendReferralEmail = async (refereeEmail, refereeName, referrerName, courseName) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Email service not configured, skipping email send');
    return false;
  }

  const mailOptions = {
    from: `"Accredian Courses" <${process.env.SMTP_USER}>`,
    to: refereeEmail,
    subject: `${referrerName} has referred you for ${courseName}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Hello ${refereeName}! 👋</h2>
        <p>Your friend <strong>${referrerName}</strong> thinks you'd be interested in our <strong>${courseName}</strong> course.</p>
        <p>Here's what you'll learn:</p>
        <ul style="list-style-type: none; padding: 0;">
          <li style="margin: 10px 0; padding-left: 20px; position: relative;">
            ✨ Industry-relevant skills
          </li>
          <li style="margin: 10px 0; padding-left: 20px; position: relative;">
            📚 Practical projects
          </li>
          <li style="margin: 10px 0; padding-left: 20px; position: relative;">
            🎯 Career guidance
          </li>
        </ul>
        <div style="margin: 30px 0; text-align: center;">
          <a href="https://accredian-frontend-task.vercel.app" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Explore Course
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Best regards,<br>
          <strong>Accredian Team</strong>
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Referral email sent successfully to:', refereeEmail);
    return true;
  } catch (error) {
    console.error('Error sending referral email:', error);
    return false;
  }
};
