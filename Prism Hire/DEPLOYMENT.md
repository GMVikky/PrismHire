
# Deployment Guide: Prism Hire

This guide provides step-by-step instructions to deploy the complete application for completely free using **Vercel** (Frontend), **Render** (Backend), and **MongoDB Atlas** (Database).

## Prerequisites

1.  **GitHub Account**: You must push this project to a GitHub repository.
2.  **MongoDB Atlas Account**: You need a cloud database.
3.  **Render Account**: For hosting the backend.
4.  **Vercel Account**: For hosting the frontend.

---

## Step 1: Push to GitHub

1.  Create a new repository on GitHub.
2.  Push your code:
    ```bash
    git init
    git add .
    git commit -m "Ready for deployment"
    git branch -M main
    git remote add origin <YOUR_GITHUB_REPO_URL>
    git push -u origin main
    ```

---

## Step 2: Database Setup (MongoDB Atlas)

1.  Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  Create a **Cluster** (Select the Free 'M0 Sandbox' tier).
3.  **Database Access**: Create a database user (username and password). *Remember these credentials.*
4.  **Network Access**: Add IP Address `0.0.0.0/0` to allow access from anywhere (required for Render's dynamic IPs).
5.  Get your **Connection String**:
    *   Click "Connect" -> "Connect your application".
    *   Copy the string (e.g., `mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority`).
    *   Replace `<password>` with your actual password.

---

## Step 3: Backend Deployment (Render.com)

1.  Log in to [Render](https://render.com/).
2.  Click **"New +"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Configuration**:
    *   **Name**: `prism-hire-backend` (or similar).
    *   **Region**: Closest to you (e.g., Frankfurt, Singapore, Ohio).
    *   **Branch**: `main`.
    *   **Root Directory**: `server` (Important!).
    *   **Runtime**: `Node`.
    *   **Build Command**: `npm install`.
    *   **Start Command**: `node server.js`.
    *   **Instance Type**: Free.
5.  **Environment Variables** (Click "Advanced" or "Environment"):
    Add the following keys and values from your local `.env` file:
    *   `MONGODB_URI`: (Your MongoDB Atlas connection string)
    *   `JWT_SECRET`: (A secure long random string)
    *   `MY_GEMINI_KEY`: (Your Google Gemini API Key)
    *   `PORT`: `10000` (Render sets this automatically, but good to know)
6.  Click **Create Web Service**.
7.  Wait for deployment to finish. **Copy the Service URL** (e.g., `https://prism-hire-backend.onrender.com`). You will need this for the frontend.

**Note**: The free tier on Render spins down after inactivity. The first request might take 30-50 seconds.

---

## Step 4: Frontend Deployment (Vercel)

1.  Log in to [Vercel](https://vercel.com/).
2.  Click **"Add New..."** -> **"Project"**.
3.  Import your GitHub repository.
4.  **Project Configuration**:
    *   **Framework Preset**: Vite.
    *   **Root Directory**: Click "Edit" and select `client`.
5.  **Environment Variables**:
    *   Key: `VITE_API_URL`
    *   Value: Your Render Backend URL (e.g., `https://prism-hire-backend.onrender.com`). **Do not add a trailing slash.**
6.  Click **Deploy**.

---

## Step 5: Final Check

1.  Open your Vercel App URL.
2.  Try to Log In or Register.
3.  If it works, congratulations! Your app is live.

### Troubleshooting
*   **CORS Errors**: If you see CORS errors in the browser console, check the network tab. The backend typically allows all origins by default in this setup, but ensure your `server.js` has `app.use(cors())`.
*   **Connection Refused**: Your Render backend might be sleeping. Wait a minute and try again.
*   **Database Error**: Check your MongoDB Atlas Network Access (IP Whitelist).
