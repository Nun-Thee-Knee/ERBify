const {
    GoogleGenerativeAI,
  } = require("@google/generative-ai");
  
  const apiKey = "AIzaSyCH71wr4XQzrdifvrL5fqKpZ5sQ6RZJU9g";
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 0,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  async function run(data) {
    const parts = [
        { text: `input: Give the equivalent erb code of the haml ${data} and don't give explanation` },
        { text: "output: " },
    ];
  
    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
    });
  
    return result.response.text().split("erb")[1].split("```")[0];
  }
  
  module.exports = { run };