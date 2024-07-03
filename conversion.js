const vscode = require('vscode');
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { HarmBlockThreshold, HarmCategory } = require("@google/generative-ai");

function getApiKey() {
    return vscode.workspace.getConfiguration().get('erbify.apiKey');
}

async function getData(data) {
    const apiKey = getApiKey();

    if (!apiKey) {
        vscode.window.showErrorMessage('API key is not set. Please configure it in the settings.');
        return;
    }

    const model = new ChatGoogleGenerativeAI({
        apiKey: apiKey,
        model: "gemini-pro",
        maxOutputTokens: 8179,
        safetySettings: [
            {
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
            {
                category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                threshold: HarmBlockThreshold.BLOCK_NONE,
            },
        ],
    });

    try {
        const res = await model.invoke([
            [
                "human",
                `Convert this haml ${data} file to erb`
            ],
        ]);
        return res.content;
    } catch (error) {
        console.error('Error invoking model:', error);
        vscode.window.showErrorMessage('Failed to convert HAML to ERB. Please check your API key and network connection.');
    }
}

module.exports = { getData };
