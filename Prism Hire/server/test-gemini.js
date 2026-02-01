require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent("Say hello in one sentence");
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API working!');
        console.log('Response:', text);
    } catch (error) {
        console.error('❌ Gemini API Error:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack?.substring(0, 500));
    }
}

testGemini();
