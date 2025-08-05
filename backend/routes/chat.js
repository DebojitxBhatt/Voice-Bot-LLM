import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import llmService from '../services/llmService.js';
import { textToSpeechBuffer } from '../services/ttsService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { text } = req.body;

  // Input validation
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Valid text input is required' });
  }

  // Sanitize input (remove potential XSS)
  const sanitizedText = text.trim().replace(/[<>]/g, '');
  
  if (sanitizedText.length === 0) {
    return res.status(400).json({ error: 'Text cannot be empty' });
  }

  if (sanitizedText.length > 1000) {
    return res.status(400).json({ error: 'Text too long (max 1000 characters)' });
  }

  try {
    // Get response from LLM service
    const reply = await llmService.getResponse(sanitizedText);

    // Generate audio buffer directly (no file saving)
    const audioBuffer = await textToSpeechBuffer(reply);

    // Return both text and audio buffer
    res.json({
      message: reply,
      audioData: audioBuffer.toString('base64'), // Convert buffer to base64 for JSON transmission
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Chat route error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'LLM or TTS failed' });
  }
});

export default router;
