import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { sendReferralEmail } from './utils/email.js';  // Changed from emailService.js to email.js
// import { sendEmail, isAuthenticated } from './utils/gmail.js';  // Added Gmail import
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'https://accredian-frontend-task.vercel.app'],
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Backend is running!',
    environment: process.env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'Configured' : 'Not configured',
    emailService: process.env.SMTP_USER ? 'Configured' : 'Not configured',
    gmailService: isAuthenticated() ? 'Configured' : 'Not configured'
  });
});

// Create referral
app.post('/api/referrals', async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail, courseName } = req.body;

    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        courseName,
        status: 'pending'
      },
    });

    // Try SMTP first, then Gmail API as fallback
    let emailSent = false;
    try {
      emailSent = await sendReferralEmail(refereeEmail, refereeName, referrerName, courseName);
    } catch (smtpError) {
      console.error('SMTP email failed, trying Gmail API:', smtpError);
      
      if (isAuthenticated()) {
        const emailOptions = {
          to: refereeEmail,
          from: `"Accredian Courses" <${process.env.SMTP_USER}>`,
          subject: `${referrerName} has referred you for ${courseName}!`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Hello ${refereeName}! 👋</h2>
              <p>Your friend <strong>${referrerName}</strong> thinks you'd be interested in our <strong>${courseName}</strong> course.</p>
              <!-- Rest of your email template -->
            </div>
          `
        };
        
        const gmailResult = await sendEmail(emailOptions);
        emailSent = gmailResult.success;
      }
    }

    res.json({
      success: true,
      message: 'Referral created successfully',
      data: referral,
      emailSent
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create referral',
      error: error.message,
    });
  }
});

// Get all referrals (for testing)
app.get('/api/referrals', async (req, res) => {
  try {
    const referrals = await prisma.referral.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json({
      success: true,
      data: referrals
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referrals',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Database URL configured:', !!process.env.DATABASE_URL);
  console.log('SMTP Email configured:', !!process.env.SMTP_USER);
  console.log('Gmail API configured:', isAuthenticated());
});
