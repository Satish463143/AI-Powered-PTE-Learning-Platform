require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
})

const generateAiResponse = async (messages, options = {}) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error('Messages array cannot be empty');
    }

    // Ensure system message is at the top
    const hasSystem = messages.find(msg => msg.role === 'system');
    if (!hasSystem) {
      messages.unshift({
        role: 'system',
        content: 'You are a fluent English-speaking tutor. Do not use any symbols or formatting. Keep answers short, plain, and friendly.'
      });
    }

    const response = await openai.chat.completions.create({
      model: "google/gemini-2.5-flash",
      messages,
      temperature: 1,
      max_tokens: 1000,
      top_p: 1,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.log(error);
    throw error;
  }
};


module.exports = generateAiResponse;