const vscode = require('vscode');
const Groq = require('groq-sdk');
const groq = new Groq({apiKey: "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"});

async function convertHamlToErb(haml) {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": `Convert the following haml to erb\n ${haml}`
      }
    ],
    "model": "llama3-8b-8192",
    "temperature": 0,
    "max_tokens": 8192,
    "top_p": 1,
    "stream": true,
    "stop": null
  });
  
  let erb = "";
  for await (const chunk of chatCompletion) {
    erb += chunk.choices[0]?.delta?.content || '';
  }

  const firstTagIndex = erb.indexOf('<');
  const lastTagIndex = erb.lastIndexOf('>');

  if (firstTagIndex === -1 || lastTagIndex === -1 || firstTagIndex >= lastTagIndex) {
    return "";
  }

  const extractedContent = erb.slice(firstTagIndex, lastTagIndex + 1);

  return extractedContent;
}

async function getData(data) {
    try {
        const erb = await convertHamlToErb(data);
        return erb;
    } catch (error) {
        console.error('Error invoking model:', error);
        vscode.window.showErrorMessage('Failed to convert HAML to ERB. Please check your API key and network connection.');
    }
}

module.exports = { getData };