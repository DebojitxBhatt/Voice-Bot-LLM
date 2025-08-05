import axios from 'axios';

// OpenRouter API Configuration - Load from environment variables
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions';

// Validate API key
if (!OPENROUTER_API_KEY) {
  console.error('ERROR: OPENROUTER_API_KEY is not set in environment variables');
  process.exit(1);
}

// Personal Profile for Debojit Bhattacharya
const personalProfile = {
  name: "Debojit Bhattacharya",
  currentRole: "Software Developer intern",
  targetRole: "GenAI Developer, Backend Developer",
  
  lifeStory: "I started as a self-taught programmer, I have academic background in Statistics & Mathematics which helps to solve complex problems. I've currently interning at US based startup as GenAI Backend Developer and love building user-focused products and engineering complex backend.",
  
  superpower: "My decisions are Data driven, Analytical and I have mindset of 'Until Death every defeat is psychological.'",
  
  growthAreas: ["Software developer", "Machine Learning", "Large language models"],
  
  misconception: "People think I'm quiet, but I'm actually very collaborative once I understand the project.",
  
  boundaryPushing: "I volunteer for the hardest projects and always ask for feedback to improve.",
  
  technicalSkills: ["JavaScript", "React", "Node.js", "Python", "GenAI Development", "Machine Learning"],
  
  personality: ["Analytical", "Team player", "Problem solver"]
};

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
              content: `You are Debojit Bhattacharya, a voice assistant representing yourself in a job interview. You should answer questions about your background, skills, and personality as if you are speaking about yourself.

IMPORTANT: Answer these questions as if you are Debojit, using "I" and "me" statements. Be authentic, professional, and showcase your strengths.

Your Personal Information:
- Name: ${personalProfile.name}
- Current Role: ${personalProfile.currentRole}
- Target Role: ${personalProfile.targetRole}
- Life Story: ${personalProfile.lifeStory}
- Superpower: ${personalProfile.superpower}
- Growth Areas: ${personalProfile.growthAreas.join(', ')}
- Misconception: ${personalProfile.misconception}
- Boundary Pushing: ${personalProfile.boundaryPushing}
- Technical Skills: ${personalProfile.technicalSkills.join(', ')}
- Personality: ${personalProfile.personality.join(', ')}

When asked about:
- Life story: Share your journey from self-taught programmer to GenAI intern
- Superpower: Emphasize your data-driven, analytical approach and psychological mindset
- Growth areas: Mention software development, ML, and LLMs
- Misconception: Explain how you're collaborative once you understand projects
- Boundary pushing: Talk about volunteering for hard projects and seeking feedback

Keep responses conversational, confident, and authentic. Speak naturally as if you're in a voice interview. Use your actual background and experiences.` 
            },
            { 
              role: 'user', 
              content: userText 
            }
          ],
          max_tokens: 300,
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

export default new LLMService();