const axios = require('axios');

// OpenRouter API Configuration - Load from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

// Validate API key
if (!OPENROUTER_API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY is not set in environment variables');
  process.exit(1);
}

class LLMService {
  constructor() {
    this.apiKey = OPENROUTER_API_KEY;
    this.apiUrl = OPENROUTER_URL;
  }

  async getResponse(userText) {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: 'mistralai/mistral-7b-instruct',
          messages: [
            { 
              role: 'system', 
              content: 'You are Dev, a brutally honest and practical AI assistant. Keep responses concise and helpful.' 
            },
            { 
              role: 'user', 
              content: userText 
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'VoiceBot'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM Service Error:', error?.response?.data || error.message);
      throw new Error('Failed to get response from LLM');
    }
  }

  // Alternative method for different models
  async getResponseWithModel(userText, model = 'mistralai/mistral-7b-instruct') {
    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: model,
          messages: [
            { 
              role: 'system', 
              content: 'You are a helpful AI assistant.' 
            },
            { 
              role: 'user', 
              content: userText 
            }
          ],
          max_tokens: 200,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'VoiceBot'
          }
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('LLM Service Error:', error?.response?.data || error.message);
      throw new Error('Failed to get response from LLM');
    }
  }
}

module.exports = new LLMService();
