import axios from 'axios';

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
              content: `You are Debojit. Answer briefly as yourself. Key: Self-taught programmer, GenAI intern, data-driven mindset, growth in ML/LLMs, collaborative once I understand projects, volunteer for hard tasks. Keep responses under 2 sentences.`
            },
            { 
              role: 'user', 
              content: userText 
            }
          ],
          max_tokens: 80,
          temperature: 0.3
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://voice-bot-llm-backend.onrender.com',
            'X-Title': 'VoiceBot'
          },
          timeout: 5000 // 5 second timeout
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
            'HTTP-Referer': process.env.FRONTEND_URL || 'https://voice-bot-llm-backend.onrender.com',
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

export default new LLMService();