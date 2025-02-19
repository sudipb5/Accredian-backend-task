import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Gmail API instance
const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Function to generate OAuth2 URL
export const getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://mail.google.com/'
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

// Function to get tokens from code
export const getTokens = async (code) => {
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
};

// Function to encode email to base64
const encodeEmail = ({ to, from, subject, html }) => {
  const str = [
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    '',
    html
  ].join('\n');

  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

// Function to send email using Gmail API
export const sendEmail = async (options) => {
  try {
    const raw = encodeEmail(options);
    const result = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw,
      },
    });
    return { success: true, messageId: result.data.id };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Function to set credentials
export const setCredentials = (tokens) => {
  oauth2Client.setCredentials(tokens);
  // Store tokens in environment variables for persistence
  process.env.GMAIL_ACCESS_TOKEN = tokens.access_token;
  if (tokens.refresh_token) {
    process.env.GMAIL_REFRESH_TOKEN = tokens.refresh_token;
  }
};

// Initialize credentials if they exist
if (process.env.GMAIL_ACCESS_TOKEN) {
  oauth2Client.setCredentials({
    access_token: process.env.GMAIL_ACCESS_TOKEN,
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });
}

// Function to check if we're authenticated
export const isAuthenticated = () => {
  return !!process.env.GMAIL_ACCESS_TOKEN;
};

// Function to handle token refresh
oauth2Client.on('tokens', (tokens) => {
  if (tokens.refresh_token) {
    process.env.GMAIL_REFRESH_TOKEN = tokens.refresh_token;
  }
  process.env.GMAIL_ACCESS_TOKEN = tokens.access_token;
});
