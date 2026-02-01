const fs = require('fs');
const util = require('util');
const logFile = fs.createWriteStream('connection-log.txt', { flags: 'w' });
const logStdout = process.stdout;

console.log = function (d) {
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

console.error = function (d) {
    logFile.write(util.format(d) + '\n');
    logStdout.write(util.format(d) + '\n');
};

require('dotenv').config({ path: __dirname + '/.env' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function checkConnection() {
    console.log("----------------------------------------");
    console.log("🔍 DIAGNOSTIC: Checking Gemini Connection");
    console.log("----------------------------------------");

    const key = process.env.MY_GEMINI_KEY;

    if (!key) {
        console.error("❌ ERROR: GEMINI_API_KEY is not found in environment variables.");
        return;
    }

    console.log(`🔑 API Key found: ${key.substring(0, 8)}...${key.substring(key.length - 4)}`);
    console.log(`Attempting to connect to Gemini (model: gemini-2.5-flash)...`);

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent("Test connection. Reply with 'Connected'.");
        const response = await result.response;
        const text = response.text();

        console.log("✅ SUCCESS: Connection established!");
        console.log(`🤖 Model Replied: "${text}"`);

    } catch (error) {
        console.error("❌ FAILURE: Connection failed.");
        console.error("----------------------------------------");
        console.error("RAW ERROR:", util.inspect(error, { showHidden: false, depth: null, colors: false }));

        if (error.response) {
            console.error("Status:       ", error.response.status);
            console.error("Status Text:  ", error.response.statusText);
        }
        console.error("----------------------------------------");

        if (error.message.includes("429")) {
            console.log("👉 DIAGNOSIS: QUOTA EXCEEDED. The request reached Google, but your API key has used up its free limit.");
        } else if (error.message.includes("API key not valid")) {
            console.log("👉 DIAGNOSIS: INVALID KEY. The request reached Google, but the key is wrong.");
        } else if (error.code === 'ENOTFOUND') {
            console.log("👉 DIAGNOSIS: NETWORK ERROR. Calculated request could not leave the server. Check internet connection.");
        }
    }
}

checkConnection();
