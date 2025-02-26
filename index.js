import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { sendReferralEmail } from './utils/email.js';
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
    emailService: process.env.SMTP_USER ? 'Configured' : 'Not configured'
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

    // Send email notification
    let emailSent = false;
    try {
      emailSent = await sendReferralEmail(refereeEmail, refereeName, referrerName, courseName);
    } catch (error) {
      console.error('Error sending email:', error);
      // Continue even if email fails
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
});
