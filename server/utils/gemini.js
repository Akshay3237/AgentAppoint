const axios = require('axios');
require('dotenv').config();
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const geminiChat = async (prompt) => {
  try {
    const response = await axios.post(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        contents: [
          {
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        params: {
          key: GEMINI_API_KEY
        }
      }
    );

    return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    return 'Error getting response from Gemini.';
  }
};

module.exports = geminiChat;
