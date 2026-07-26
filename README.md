# LeadDesk Mini

LeadDesk Mini is a full-stack lead-capture product designed for seamless lead generation and management. It features a modern public landing page for visitors to submit inquiries and a secure administrative dashboard for managing leads.

## Tech Stack
- **Frontend**: React (Vite), React Router, Axios, Lucide React (Icons), Custom CSS Modules (Dark mode, responsive)
- **Backend**: Node.js, Express, Mongoose, JWT, bcrypt
- **Database**: MongoDB

## Data Model

The database uses MongoDB and consists of two primary collections:

1. **Leads**
   - `name` (String, Required): The full name of the lead.
   - `email` (String, Required): The email address, stored in lowercase.
   - `budget` (String, Required): Selected budget range.
   - `message` (String, Required): Detailed project requirements.
   - `status` (String, Enum: ['New', 'Contacted', 'Closed'], Default: 'New'): Tracks the current stage of the lead in the sales pipeline.
   - `createdAt` / `updatedAt` (Timestamps): Automatically managed by Mongoose.

2. **Admins**
   - `username` (String, Required, Unique): The login username.
   - `password` (String, Required): The hashed password for authentication.
   - `createdAt` / `updatedAt` (Timestamps).

## Authentication Approach

The admin portal is secured using **JSON Web Tokens (JWT)** and **bcrypt**.

1. **Password Hashing**: When an admin account is created, the password is hashed using `bcrypt` (with a salt factor of 10) before being stored in the database. Raw passwords are never exposed or saved.
2. **Login & Token Generation**: When an admin logs in at `/admin/login`, the backend compares the provided password with the stored hash. If successful, it generates a JWT signed with a secret key (`JWT_SECRET`) and an expiration time of 24 hours.
3. **Session Management**: The frontend stores the JWT in `localStorage`. The `AuthContext` decodes the token (using `jwt-decode`) to check expiration on load.
4. **Protected Routes (Frontend)**: The `/admin` route is wrapped in a `<ProtectedRoute />` component that redirects unauthenticated users to `/admin/login`.
5. **Protected Endpoints (Backend)**: Admin endpoints (like fetching all leads or updating status) pass through the `auth` middleware, which verifies the Bearer token in the `Authorization` header. If the token is invalid or missing, it responds with a 401 Unauthorized status.

## Deployment Guide (Render + MongoDB Atlas)

1. Create a MongoDB Atlas cluster, get the connection URI.
2. In Render, create a new Web Service for the backend.
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Set Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `SETUP_SECRET`.
3. In Render/Vercel/Netlify, deploy the frontend.
   - Build Command: `npm run build`
   - Publish Directory: `dist`
   - Set Environment Variable: `VITE_API_URL` to point to the backend URL.

## Loom Walkthrough Requirement
*(Since I am an AI, I cannot record a Loom video. Please record your own video following these steps:)*
1. Go to the public landing page and submit the lead form.
2. Show the success message.
3. Navigate to `/admin/login` and sign in.
4. View the newly created lead in the dashboard.
5. Change the lead's status from "New" to "Contacted" or "Closed" to demonstrate the update flow.

---
Built for Digital Heroes Training Task - [digitalheroesco.com](https://digitalheroesco.com)
