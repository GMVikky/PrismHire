const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs').promises;
const path = require('path');

/**
 * Extract text from PDF file
 */
async function extractFromPDF(filePath) {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error(`PDF parsing failed: ${error.message}`);
    }
}

/**
 * Extract text from DOCX file
 */
async function extractFromDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value;
    } catch (error) {
        throw new Error(`DOCX parsing failed: ${error.message}`);
    }
}

/**
 * Extract text from plain text files (TXT, RTF, etc.)
 */
async function extractFromTextFile(filePath) {
    try {
        const text = await fs.readFile(filePath, 'utf-8');
        return text;
    } catch (error) {
        throw new Error(`Text file parsing failed: ${error.message}`);
    }
}

/**
 * Clean and normalize extracted text
 */
function cleanText(text) {
    return text
        .replace(/\r\n/g, '\n')  // Normalize line breaks
        .replace(/\s+/g, ' ')     // Remove extra whitespace
        .replace(/[^\w\s@.+#-]/gi, ' ')  // Keep only alphanumeric and common symbols
        .toLowerCase()
        .trim();
}

/**
 * Main function to parse resume based on file type
 */
async function parseResume(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    let rawText;

    if (ext === '.pdf') {
        rawText = await extractFromPDF(filePath);
    } else if (ext === '.docx' || ext === '.doc') {
        rawText = await extractFromDOCX(filePath);
    } else if (ext === '.txt' || ext === '.rtf' || ext === '.odt') {
        rawText = await extractFromTextFile(filePath);
    } else {
        throw new Error('Unsupported file format. Please upload PDF, DOCX, DOC, TXT, RTF, or ODT.');
    }

    // Clean and normalize the text
    const cleanedText = cleanText(rawText);

    return {
        rawText,
        cleanedText
    };
}

module.exports = {
    parseResume,
    cleanText
};
