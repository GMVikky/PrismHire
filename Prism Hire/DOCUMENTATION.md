# Project Documentation: My_Prep_Dev

This document provides a comprehensive overview of the **My_Prep_Dev** platform, a modern AI-powered interview preparation suite.

---

## 🚀 Project Overview
**My_Prep_Dev** is a full-stack web application designed to help users prepare for technical interviews. It leverages the **Google Gemini 1.5 Flash** AI model to generate dynamic, role-specific assessments. Users can take tests, save specific questions to their personal library, track their scores, and manage their professional profiles.

---

## 🛠 Technology Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API (AuthContext)
- **API Client**: Axios

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose)
- **Authentication**: JSON Web Tokens (JWT) & Bcrypt.js
- **AI Integration**: Google Generative AI (Gemini 1.5 Flash)

---

## 📂 Folder Structure

```text
My_Prep_Dev/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   │   ├── Sidebar.jsx        # Navigation Sidebar
│   │   │   ├── TestModule.jsx     # AI Question Generator
│   │   │   ├── SavedQuestions.jsx # Quiz/Library Module
│   │   │   ├── Settings.jsx       # Profile Management
│   │   │   ├── AuthForm.jsx       # Login/Register UI
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Global Auth State
│   │   ├── lib/
│   │   │   └── api.js             # Axios Configuration
│   │   ├── pages/
│   │   │   └── Dashboard.jsx      # Main Application UI
│   │   └── App.jsx                # Routing & Entry
│   └── tailwind.config.js
├── server/                 # Node.js Backend
│   ├── models/             # Mongoose Schemas
│   │   ├── User.js                # User Profile Schema
│   │   └── SavedQuestion.js       # Saved Questions Schema
│   ├── .env                       # Environment Variables
│   └── server.js                  # Main API Server
└── package.json
```

---

## 🔑 Core Features & Modules

### 1. AI Assessment Engine (`TestModule`)
- **Dynamic Generation**: Generates 5 multiple-choice questions based on **Job Role** (e.g., Frontend, DevOps) and **Difficulty** (Entry to Expert).
- **Save Selection**: Allows users to cherry-pick specific questions from the AI results to save to their permanent library.
- **Smart Loading**: Features a "Generate 5 More" button to append more questions to the current set.

### 2. Saved Questions Library (`SavedQuestions`)
- **Organization**: Questions are automatically grouped by Job Role.
- **Test Mode**: Users can take a "Mini-Quiz" based solely on their saved questions.
- **Enhanced Validation**: Real-time scoring with visual badges (**Correct** in Green, **Wrong** in Red).
- **Retake Logic**: Ability to instantly reset and retake the assessment.

### 3. Profile & Settings
- **Profile Customization**: Users can update their Full Name and upload a Profile Picture.
- **Auto-Sync**: Profile data is synchronized between MongoDB and the application UI in real-time.
- **Visual Branding**: The sidebar dynamically displays the user's name and image.

### 4. Authentication
- **Secure Access**: JWT-based authentication for all private modules.
- **Persistence**: Remembers users across sessions via secure LocalStorage sync.

---

## 📡 API Endpoints (Backend)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | User signup |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/generate-test` | Calls Gemini AI to create questions |
| `POST` | `/api/save-questions` | Saves selected questions to DB |
| `GET` | `/api/saved-questions` | Retrieves user's saved question library |
| `GET` | `/api/user/profile` | Fetches current user details |
| `PUT` | `/api/user/profile` | Updates user name/profile picture |

---

## 💾 Database Models

### `User` Schema
- `name`: String (Required)
- `email`: String (Unique, Required)
- `password`: String (Hashed)
- `profilePicture`: String (Base64/URL)

### `SavedQuestion` Schema
- `userId`: ObjectId (Reference)
- `jobRole`: String
- `difficulty`: String
- `text`: String
- `options`: Array[String]
- `correctAnswer`: String

---

## 🚀 Setup & Execution

1.  **Server**:
    - Add `GEMINI_API_KEY` and `MONGODB_URI` to `server/.env`.
    - `cd server` -> `npm run dev`.
2.  **Client**:
    - `cd client` -> `npm run dev`.
    - Access via `http://localhost:5173`.
