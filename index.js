import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { sendReferralEmail } from './utils/email.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.use('/', authRoutes);

// Basic route to check Gmail auth status
app.get('/', (req, res) => {
  const isAuthEnabled = !!process.env.GMAIL_ACCESS_TOKEN;
  res.send(`
    <html>
      <head>
        <title>Referral System - Email Setup</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; text-align: center; }
          .status { display: inline-block; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }
          .status.active { background-color: #4CAF50; color: white; }
          .status.inactive { background-color: #f44336; color: white; }
          .button { display: inline-block; padding: 12px 24px; background-color: #4285f4; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .info { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: left; }
        </style>
      </head>
      <body>
        <h1>Email Service Setup</h1>
        <div class="status ${isAuthEnabled ? 'active' : 'inactive'}">
          Status: ${isAuthEnabled ? 'Authenticated ✅' : 'Not Authenticated ❌'}
        </div>
        
        ${!isAuthEnabled ? `
          <p>Click the button below to authenticate with Gmail:</p>
          <a href="/auth/gmail" class="button">
            Authenticate Gmail
          </a>
        ` : `
          <p>Gmail authentication is complete. You can now use the referral system.</p>
        `}

        <div class="info">
          <h3>Configuration Details:</h3>
          <ul>
            <li>Email: syedrayanr786@gmail.com</li>
            <li>Redirect URI: ${process.env.GOOGLE_REDIRECT_URI}</li>
            <li>Server Status: Active</li>
          </ul>
        </div>
      </body>
    </html>
  `);
});

// POST: Create a new referral
app.post('/api/referrals', async (req, res) => {
  try {
    const { referrerName, referrerEmail, refereeName, refereeEmail, courseName } = req.body;

    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
        courseName
      }
    });

    // Send email notifications
    const emailResult = await sendReferralEmail({
      referrerName,
      referrerEmail,
      refereeName,
      refereeEmail,
      courseName
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
    }
    
    res.json({
      success: true,
      message: 'Referral created successfully',
      data: referral,
      emails: emailResult.success ? {
        message: 'Preview emails at:',
        previewUrls: emailResult.previewUrls
      } : {
        message: 'Email sending failed',
        error: emailResult.error
      }
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating referral',
      error: error.message
    });
  }
});

// GET: List all referrals
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
      message: 'Error fetching referrals',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
