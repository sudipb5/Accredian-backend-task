# Referomatic Hub - Course Referral System

A full-stack application for managing course referrals with email notifications.

## Project Structure

```
referomatic-hub/
└── server/           # Express backend
```

## Setup Instructions

### Backend Setup (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   npx prisma generate
   ```

3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL="mysql://root:root@localhost:3306/referomaticdb"
   GOOGLE_CLIENT_ID="your_client_id"
   GOOGLE_CLIENT_SECRET="your_client_secret"
   GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"
   PORT=5000
   ```

4. Start the server:
   ```bash
   npm run dev
   ```