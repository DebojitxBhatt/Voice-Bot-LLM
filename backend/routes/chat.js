const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const llmService = require('../services/llmService');
const { textToSpeechBuffer } = require('../services/ttsService');

router.post('/', async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).json({ error: 'No text provided' });

  try {
    // Get response from LLM service
    const reply = await llmService.getResponse(text);

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

module.exports = router;
