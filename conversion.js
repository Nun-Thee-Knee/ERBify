const vscode = require('vscode');
const Groq = require('groq-sdk');
const groq = new Groq({apiKey: "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"});

async function convertHamlToErb(haml) {
  const chatCompletion = await groq.chat.completions.create({
    "messages": [
      {
        "role": "user",
        "content": `Convert the following haml to erb\n ${haml} and don't include any extra explanation or data`
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
        var erb = await convertHamlToErb(data);
        // console.log(erb)
        if (erb.includes("\`\`\`"))
        {
          erb.split("\`\`\`")
          erb = erb[0]
        }
        return erb;
    } catch (error) {
        console.error('Error invoking model:', error);
        vscode.window.showErrorMessage('Failed to convert HAML to ERB. Please check your API key and network connection.');
    }
}

// getData(`
//   <h1>Hello world</h1>
// <% @collections.each do |collection| %>
//   <%= collection %>
// <% end %>
//   `)
module.exports = { getData };