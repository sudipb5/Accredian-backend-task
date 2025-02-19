import { sendEmail } from './gmail.js';
import dotenv from 'dotenv';

dotenv.config();

export const sendReferralEmail = async (referralData) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail, courseName } = referralData;

  try {
    // Send email to referee
    const refereeResult = await sendEmail({
      to: refereeEmail,
      from: 'eng21cs0437@dsu.edu.in',
      subject: `${referrerName} has referred you for ${courseName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>You've Been Referred!</h2>
          <p>Hello ${refereeName},</p>
          <p>${referrerName} (${referrerEmail}) has referred you for the course: <strong>${courseName}</strong>.</p>
          <p>We're excited to have you join us! Click the button below to learn more about the course:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              View Course Details
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to us!</p>
          <p>Best regards,<br>Your Course Team</p>
        </div>
      `
    });

    // Send email to referrer
    const referrerResult = await sendEmail({
      to: referrerEmail,
      from: 'eng21cs0437@dsu.edu.in',
      subject: `Thank you for referring ${refereeName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thank You for Your Referral!</h2>
          <p>Hello ${referrerName},</p>
          <p>Thank you for referring ${refereeName} to the course: <strong>${courseName}</strong>.</p>
          <p>We've sent them an email with more information about the course.</p>
          <p>We appreciate your support in growing our community!</p>
          <p>Best regards,<br>Your Course Team</p>
        </div>
      `
    });

    return {
      success: refereeResult.success && referrerResult.success,
      refereeEmail: refereeResult,
      referrerEmail: referrerResult
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
