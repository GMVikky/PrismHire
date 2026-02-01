const { GoogleGenerativeAI } = require('@google/generative-ai');

// Define AI model personas - all powered by Gemini
const AI_PERSONAS = {
    chatgpt: {
        name: 'ChatGPT (OpenAI)',
        systemPrompt: `You are ChatGPT, a large language model trained by OpenAI. 
You are helpful, creative, clever, and very friendly. You provide detailed, well-structured responses.
You tend to be conversational and sometimes use phrases like "I'm happy to help" or "Let me explain".
Format your responses in a clear, organized manner with proper paragraphs.`
    },
    claude: {
        name: 'Claude (Anthropic)',
        systemPrompt: `You are Claude, an AI assistant created by Anthropic.
You are thoughtful, nuanced, and aim to be helpful, harmless, and honest.
You provide balanced perspectives and often acknowledge complexity in topics.
You're known for being detailed and thorough in your explanations.
You sometimes use phrases like "I appreciate your question" or "Let me think through this carefully".`
    },
    gemini: {
        name: 'Gemini (Google)',
        systemPrompt: `You are Gemini, Google's most capable AI model.
You are direct, informative, and precise. You provide comprehensive answers backed by knowledge.
You excel at breaking down complex topics and providing clear explanations.
You maintain a professional yet approachable tone.`
    }
};

// Helper function to call Gemini with a specific persona
const callGeminiWithPersona = async (prompt, modelKey) => {
    if (!process.env.MY_GEMINI_KEY) {
        return 'Configuration Error: Gemini API Key missing.';
    }

    const persona = AI_PERSONAS[modelKey];
    if (!persona) {
        return 'Error: Unknown AI model';
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.MY_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Combine system prompt with user prompt
        const fullPrompt = `${persona.systemPrompt}\n\nUser Query: ${prompt}\n\nRespond in character as ${persona.name}:`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        throw new Error(`${persona.name} Failed: ${error.message}`);
    }
};

// Get responses from all AI models
const getResponses = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        // Call all models in parallel
        const responses = await Promise.allSettled([
            callGeminiWithPersona(prompt, 'chatgpt'),
            callGeminiWithPersona(prompt, 'claude'),
            callGeminiWithPersona(prompt, 'gemini')
        ]);

        // Extract values or errors
        const [chatgptRes, claudeRes, geminiRes] = responses.map(r =>
            r.status === 'fulfilled' ? r.value : `Error: ${r.reason.message}`
        );

        res.json({
            chatgpt: chatgptRes,
            claude: claudeRes,
            gemini: geminiRes
        });
    } catch (error) {
        console.error('Error fetching AI responses:', error);
        res.status(500).json({ error: 'Failed to fetch responses' });
    }
};

// Streaming endpoint with personas
const streamResponses = async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    // Set headers for Server-Sent Events
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Function to send SSE messages
    const sendEvent = (model, data, done = false) => {
        res.write(`data: ${JSON.stringify({ model, data, done })}\n\n`);
    };

    try {
        // Stream all models in parallel
        await Promise.all([
            streamModelWithPersona(prompt, 'chatgpt', sendEvent),
            streamModelWithPersona(prompt, 'claude', sendEvent),
            streamModelWithPersona(prompt, 'gemini', sendEvent)
        ]);

        res.end();
    } catch (error) {
        console.error('Streaming error:', error);
        res.end();
    }
};

// Stream Gemini with persona
const streamModelWithPersona = async (prompt, modelKey, sendEvent) => {
    if (!process.env.MY_GEMINI_KEY) {
        sendEvent(modelKey, 'Configuration Error: Gemini API Key missing.', true);
        return;
    }

    const persona = AI_PERSONAS[modelKey];
    if (!persona) {
        sendEvent(modelKey, 'Error: Unknown AI model', true);
        return;
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.MY_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // Combine system prompt with user prompt
        const fullPrompt = `${persona.systemPrompt}\n\nUser Query: ${prompt}\n\nRespond in character as ${persona.name}:`;

        const result = await model.generateContentStream(fullPrompt);

        for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
                sendEvent(modelKey, chunkText, false);
            }
        }

        sendEvent(modelKey, '', true); // Signal completion
    } catch (error) {
        sendEvent(modelKey, `Error: ${error.message}`, true);
    }
};

// Summarize all responses
const summarizeResponses = async (req, res) => {
    console.log('📝 Summarize request received');
    const { responses } = req.body;

    console.log('Received responses:', Object.keys(responses || {}));

    if (!responses || typeof responses !== 'object') {
        console.log('❌ Invalid responses object');
        return res.status(400).json({ error: 'Responses object is required' });
    }

    try {
        // Build a simple, clear prompt with all AI responses
        const responsesText = Object.entries(responses)
            .filter(([_, response]) => response && response.trim() !== '')
            .map(([model, response]) => `\n### ${model.toUpperCase()} Response:\n${response}`)
            .join('\n\n---\n');

        const summaryPrompt = `You are an expert analyst. I have received responses from multiple AI models (ChatGPT, Claude, and Gemini) to the same question.

Please analyze all the responses below and create a comprehensive summary that:
1. Captures all the important information and key insights from each AI model
2. Identifies common themes and agreements across different models
3. Highlights unique perspectives or information that only specific models mentioned
4. Synthesizes everything into a clear, well-organized, and complete answer
5. Uses bullet points and clear formatting for readability

Here are all the AI responses:
${responsesText}

Now, provide a comprehensive summary that combines all the important points from these AI responses:`;

        if (!process.env.MY_GEMINI_KEY) {
            console.log('❌ Gemini API Key missing');
            return res.status(500).json({ error: 'Gemini API Key missing' });
        }

        console.log('🤖 Calling Gemini for summary...');
        const genAI = new GoogleGenerativeAI(process.env.MY_GEMINI_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(summaryPrompt);
        const response = await result.response;
        const summary = response.text();

        console.log('✅ Summary generated successfully');
        res.json({ summary });
    } catch (error) {
        console.error('❌ Summarization error:', error);
        res.status(500).json({ error: 'Failed to generate summary', details: error.message });
    }
};

module.exports = {
    getResponses,
    streamResponses,
    summarizeResponses
};
