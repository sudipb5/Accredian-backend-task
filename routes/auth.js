import express from 'express';
import { getAuthUrl, getTokens, setCredentials, isAuthenticated } from '../utils/gmail.js';

const router = express.Router();

// Route to initiate Gmail OAuth
router.get('/auth/gmail', (req, res) => {
  if (isAuthenticated()) {
    res.send('Already authenticated! You can close this window.');
  } else {
    const authUrl = getAuthUrl();
    res.redirect(authUrl);
  }
});

// OAuth callback route
router.get('/auth/google/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const tokens = await getTokens(code);
    
    // Set the tokens for future use
    setCredentials(tokens);
    
    // Save tokens to env (in a production app, store these securely)
    process.env.GMAIL_ACCESS_TOKEN = tokens.access_token;
    process.env.GMAIL_REFRESH_TOKEN = tokens.refresh_token;
    
    res.send(`
      <html>
        <body style="text-align: center; padding: 20px; font-family: Arial, sans-serif;">
          <h1 style="color: #4CAF50;">Gmail Authentication Successful!</h1>
          <p>You can now close this window and return to the application.</p>
          <p>Authentication Status: Active ✅</p>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.status(500).send('Authentication failed');
  }
});

// Check auth status
router.get('/auth/status', (req, res) => {
  res.json({ 
    authenticated: isAuthenticated(),
    email: 'eng21cs0437@dsu.edu.in'
  });
});

export default router;
