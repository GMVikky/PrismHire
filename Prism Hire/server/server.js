const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
const Session = require('./models/Session');

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_123';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/my_prep_dev';
const MY_GEMINI_KEY = process.env.MY_GEMINI_KEY;

// DEBUG: Verify which key is loaded
if (MY_GEMINI_KEY) {
    console.log("🔑 Loaded Test/Hub API Key:", MY_GEMINI_KEY.substring(0, 8) + "..." + MY_GEMINI_KEY.substring(MY_GEMINI_KEY.length - 6));
} else {
    console.log("❌ No My Gemini API Key found in environment variables.");
}

const { GoogleGenerativeAI } = require("@google/generative-ai");
// Ensure key is trimmed of whitespace
const genAI = new GoogleGenerativeAI(MY_GEMINI_KEY ? MY_GEMINI_KEY.trim() : "");

// Middleware

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// --- DATABASE CONNECTION ---
mongoose.connect(MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));

// --- MOCK DATABASE (Test Data Only) ---
const testData = {
    testId: 101,
    title: "Full Stack Competency Assessment",
    questions: [
        { id: 1, text: "What is the virtual DOM?", type: "concept" },
        { id: 2, text: "Explain the event loop in Node.js.", type: "concept" },
        { id: 3, text: "Difference between SQL and NoSQL?", type: "comparison" },
    ]
};

// --- AUTH MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token.' });
        req.user = user;
        next();
    });
};

// --- ROUTES ---

// Import SavedQuestion Model
const SavedQuestion = require('./models/SavedQuestion');
const SavedInterviewQuestion = require('./models/SavedInterviewQuestion');
const aiRoutes = require('./routes/aiRoutes');
const interviewerRoutes = require('./routes/interviewerRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// Register
app.post('/api/auth/register', async (req, res) => {
    // ... existing register code ...
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = jwt.sign({ id: newUser._id, name: newUser.name }, JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, profilePicture: newUser.profilePicture } });

    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }

        const token = jwt.sign({ id: user._id, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user._id, name: user.name, email: user.email, profilePicture: user.profilePicture } });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Test Data (Protected)
app.get('/api/test-data', authenticateToken, (req, res) => {
    res.json(testData);
});

// AI Hub Routes
app.use('/api/v1', aiRoutes);

// Interviewer Routes
app.use('/api/interviewer', interviewerRoutes);

// Resume Analyzer Routes
app.use('/api/resume', resumeRoutes);

// Save Questions Route
app.post('/api/save-questions', authenticateToken, async (req, res) => {
    try {
        const { questions } = req.body;
        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Invalid data format.' });
        }

        const savedDocs = questions.map(q => ({
            userId: req.user.id,
            sessionId: q.sessionId,
            jobRole: q.jobRole || 'General',
            difficulty: q.difficulty || 'General',
            text: q.text,
            type: q.type,
            options: q.options || [],
            correctAnswer: q.correctAnswer
        }));

        await SavedQuestion.insertMany(savedDocs);
        res.json({ message: 'Questions saved successfully!' });

    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ message: 'Failed to save questions.' });
    }
});

// Get Saved Questions Route
app.get('/api/saved-questions', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.query;
        let query = { userId: req.user.id };
        if (sessionId) {
            query.sessionId = sessionId;
        }
        const questions = await SavedQuestion.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Fetch saved error:', error);
        res.status(500).json({ message: 'Failed to fetch saved questions.' });
    }
});

// Delete Saved Question Route
app.delete('/api/saved-questions/:id', authenticateToken, async (req, res) => {
    try {
        await SavedQuestion.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Question deleted successfully.' });
    } catch (error) {
        console.error('Delete saved error:', error);
        res.status(500).json({ message: 'Failed to delete question.' });
    }
});

// Update User Profile Route (Protected)
app.put('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const { name, email, profilePicture, theme } = req.body;
        const userId = req.user.id;

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (profilePicture !== undefined) updateData.profilePicture = profilePicture;
        if (theme) updateData.theme = theme;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, select: '-password' }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.json({ message: 'Profile updated successfully!', user: updatedUser });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
});

// Get User Profile Route (Protected)
app.get('/api/user/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found.' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


// Generate Test (Protected)
app.post('/api/generate-test', authenticateToken, async (req, res) => {
    const { jobRole, difficulty, count, yearsOfExperience, topicsToFocus, jobDescription } = req.body;
    const questionCount = parseInt(count) || 5;

    try {
        if (!jobRole || !difficulty) {
            return res.status(400).json({ message: 'Job Role and Difficulty are required.' });
        }

        // Check for empty key after trim
        if (!MY_GEMINI_KEY || !MY_GEMINI_KEY.trim()) {
            throw new Error("No API Key");
        }

        // FIXED MODEL NAME: gemini-1.5-flash instead of 2.5 which doesn't exist yet/publicly
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let promptContext = `Generate exactly ${questionCount} multiple choice interview questions for a ${difficulty} level ${jobRole} role.`;

        if (yearsOfExperience) {
            promptContext += ` The candidate has ${yearsOfExperience} of experience, so tailor the complexity accordingly.`;
        }

        if (topicsToFocus) {
            promptContext += ` PRIORITY FOCUS: The questions MUST heavily focus on these specific topics: ${topicsToFocus}.`;
        }

        if (jobDescription) {
            promptContext += ` Context from Job Description: ${jobDescription.substring(0, 500)}... Use this context to make practical scenario-based questions.`;
        }

        const prompt = `${promptContext}
    Return ONLY a JSON object with this structure: 
    {
      "testId": "${Date.now()}",
      "title": "${jobRole} Assessment (${difficulty})",
      "questions": [
        { "id": 1, "text": "Question text", "type": "concept|code|behavioral", "options": ["A", "B", "C", "D"], "correctAnswer": "A" }
      ]
    }
    Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.`;

        const result = await model.generateContent(prompt);

        const response = await result.response;
        const text = response.text();

        // Cleanup potential markdown
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const jsonData = JSON.parse(cleanedText);
        res.json(jsonData);

    } catch (error) {
        // DEBUG: Log full error
        console.error("FULL GEMINI ERROR:", JSON.stringify(error, null, 2));

        if (error.message.includes('API key') || error.status === 400) {
            console.warn("⚠️ Gemini API Key Invalid/Expired. Switching to Demo Mode (Fallback Data).");
        } else {
            console.error('Gemini error:', error);
        }

        // Fallback on error to ensure user gets something - Generate 'questionCount' number of placeholders
        const fallbackQuestions = Array.from({ length: questionCount }, (_, k) => ({
            id: k + 1,
            text: `(AI Unavailable) Sample ${difficulty} question for ${jobRole} #${k + 1}`,
            type: k % 2 === 0 ? "concept" : "code",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A"
        }));

        return res.json({
            testId: Date.now(),
            title: `${jobRole} Assessment (${difficulty}) [Fallback]`,
            questions: fallbackQuestions
        });
    }
});

// Generate Interview Questions (Protected)
app.post('/api/generate-interview', authenticateToken, async (req, res) => {
    const { jobRole, difficulty, count, yearsOfExperience, topicsToFocus, jobDescription } = req.body;
    const questionCount = parseInt(count) || 2;

    try {
        if (!jobRole || !difficulty) {
            return res.status(400).json({ message: 'Job Role and Difficulty are required.' });
        }

        if (!MY_GEMINI_KEY || !MY_GEMINI_KEY.trim()) {
            throw new Error("No API Key");
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        let promptContext = `Generate exactly ${questionCount} in-depth interview questions for a ${difficulty} level ${jobRole} role.`;

        if (yearsOfExperience) {
            promptContext += ` The candidate has ${yearsOfExperience} of experience, so tailor the complexity accordingly.`;
        }

        if (topicsToFocus) {
            promptContext += ` PRIORITY FOCUS: The questions MUST heavily focus on these specific topics: ${topicsToFocus}.`;
        }

        if (jobDescription) {
            promptContext += ` Context from Job Description: ${jobDescription.substring(0, 500)}... Use this context to make practical scenario-based questions.`;
        }

        const prompt = `${promptContext}
    For EACH question, provide:
    1. The Question Text
    2. A concise "Short Answer" (1-2 sentences)
    3. A detailed "Long Answer" with a code example or scenario breakdown
    4. 4 Multiple Choice Options (for self-testing)
    5. The Correct Option

    Return ONLY a JSON object with this structure: 
    {
      "interviewId": "${Date.now()}",
      "title": "${jobRole} Interview Prep (${difficulty})",
      "questions": [
        { 
            "id": 1, 
            "question": "Question text...", 
            "shortAnswer": "Brief answer...", 
            "longAnswer": "Detailed answer with example...", 
            "options": ["A", "B", "C", "D"], 
            "correctAnswer": "A" 
        }
      ]
    }
    Do not include markdown formatting (like \`\`\`json). Just the raw JSON string.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonData = JSON.parse(cleanedText);
        res.json(jsonData);

    } catch (error) {
        console.error("FULL GEMINI ERROR:", JSON.stringify(error, null, 2));

        // Fallback Data
        const fallbackQuestions = Array.from({ length: questionCount }, (_, k) => ({
            id: k + 1,
            question: `(AI Unavailable) Sample ${difficulty} interview question for ${jobRole} #${k + 1}`,
            shortAnswer: "This is a placeholder short answer.",
            longAnswer: "This is a placeholder long answer with detailed explanation and examples.",
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctAnswer: "Option A"
        }));

        return res.json({
            interviewId: Date.now(),
            title: `${jobRole} Interview Prep (${difficulty}) [Fallback]`,
            questions: fallbackQuestions
        });
    }
});

// Save Single Interview Question
app.post('/api/save-interview-question', authenticateToken, async (req, res) => {
    try {
        const { sessionId, jobRole, difficulty, question, shortAnswer, longAnswer, options, correctAnswer } = req.body;

        if (!sessionId || !jobRole || !question || !shortAnswer || !longAnswer) {
            return res.status(400).json({ message: 'Missing required fields.' });
        }

        const savedQuestion = new SavedInterviewQuestion({
            userId: req.user.id,
            sessionId,
            jobRole,
            difficulty,
            question,
            shortAnswer,
            longAnswer,
            options: options || [],
            correctAnswer
        });

        await savedQuestion.save();
        res.json({ message: 'Interview question saved successfully!', question: savedQuestion });

    } catch (error) {
        console.error('Save interview question error:', error);
        res.status(500).json({ message: 'Failed to save interview question.' });
    }
});

// Save Multiple Interview Questions (Bulk)
app.post('/api/save-interview-questions-bulk', authenticateToken, async (req, res) => {
    try {
        const { questions } = req.body;

        if (!questions || !Array.isArray(questions)) {
            return res.status(400).json({ message: 'Invalid data format.' });
        }

        const savedDocs = questions.map(q => ({
            userId: req.user.id,
            sessionId: q.sessionId,
            jobRole: q.jobRole,
            difficulty: q.difficulty,
            question: q.question,
            shortAnswer: q.shortAnswer,
            longAnswer: q.longAnswer,
            options: q.options || [],
            correctAnswer: q.correctAnswer
        }));

        await SavedInterviewQuestion.insertMany(savedDocs);
        res.json({ message: 'Interview questions saved successfully!', count: savedDocs.length });

    } catch (error) {
        console.error('Bulk save error:', error);
        res.status(500).json({ message: 'Failed to save interview questions.' });
    }
});

// Get Saved Interview Questions for Testing
app.get('/api/saved-interview-questions', authenticateToken, async (req, res) => {
    try {
        const { sessionId, source } = req.query;
        let query = { userId: req.user.id };

        if (sessionId) {
            query.sessionId = sessionId;
        }

        // Filter by completion status
        if (source === 'completed') {
            query.isCompleted = true;
        } else if (source === 'saved') {
            // Show all saved questions (both completed and not)
            // No additional filter needed
        }

        const questions = await SavedInterviewQuestion.find(query).sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Fetch saved interview questions error:', error);
        res.status(500).json({ message: 'Failed to fetch saved interview questions.' });
    }
});

// Mark Interview Question as Completed
app.patch('/api/mark-interview-complete', authenticateToken, async (req, res) => {
    try {
        const { questionId, sessionId, questionText } = req.body;

        // Find and update the question
        const updated = await SavedInterviewQuestion.findOneAndUpdate(
            {
                userId: req.user.id,
                sessionId,
                question: questionText
            },
            { isCompleted: true },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: 'Question not found.' });
        }

        res.json({ message: 'Question marked as completed!', question: updated });
    } catch (error) {
        console.error('Mark complete error:', error);
        res.status(500).json({ message: 'Failed to mark question as completed.' });
    }
});

// Get Session Statistics
app.get('/api/session-stats', authenticateToken, async (req, res) => {
    try {
        const { sessionId } = req.query;
        if (!sessionId) return res.status(400).json({ message: 'Session ID is required.' });

        const testCount = await SavedQuestion.countDocuments({
            userId: req.user.id,
            sessionId
        });

        const interviewSavedCount = await SavedInterviewQuestion.countDocuments({
            userId: req.user.id,
            sessionId
        });

        res.json({
            testCount,
            interviewSavedCount
        });
    } catch (error) {
        console.error('Session stats error:', error);
        res.status(500).json({ message: 'Failed to fetch session stats.' });
    }
});

// --- SESSION ROUTES ---

// Create New Session
app.post('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const { sessionName, jobRole, yearsOfExperience, topicsToFocus, jobDescription } = req.body;
        const userId = req.user.id;

        if (!sessionName || !jobRole) {
            return res.status(400).json({ message: "Session Name and Job Role are required." });
        }

        // Deactivate all other sessions for this user so only one is active
        await Session.updateMany({ userId }, { isActive: false });

        const newSession = new Session({
            userId,
            sessionName,
            jobRole,
            yearsOfExperience: yearsOfExperience || "",
            topicsToFocus,
            jobDescription,
            isActive: true
        });

        await newSession.save();
        res.status(201).json(newSession);

    } catch (err) {
        console.error("Error creating session:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Set Active Session
app.put('/api/sessions/:id/activate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        // First, deactivate all sessions for this user
        await Session.updateMany({ userId }, { isActive: false });

        // Then activate the selected session
        const session = await Session.findOneAndUpdate(
            { _id: sessionId, userId },
            { isActive: true },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }

        res.json(session);
    } catch (err) {
        console.error("Error activating session:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get All Sessions for User
app.get('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.find({ userId }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (err) {
        console.error("Error fetching sessions:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a Session
app.delete('/api/sessions/:id', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const sessionId = req.params.id;

        const session = await Session.findOneAndDelete({ _id: sessionId, userId });

        if (!session) {
            return res.status(404).json({ message: "Session not found or unauthorized" });
        }

        res.json({ message: "Session deleted successfully" });
    } catch (err) {
        console.error("Error deleting session:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
