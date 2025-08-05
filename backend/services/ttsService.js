const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');

// Function to generate speech and return audio buffer directly
function textToSpeechBuffer(text) {
  return new Promise((resolve, reject) => {
    const gtts = new gTTS(text, 'en');
    
    // Create a temporary file path
    const tempPath = path.join(__dirname, '..', 'responses', `temp_${Date.now()}.mp3`);
    
    gtts.save(tempPath, function (err) {
      if (err) {
        return reject(err);
      }
      
      // Read the file as buffer
      fs.readFile(tempPath, (readErr, buffer) => {
        // Delete the temporary file immediately
        fs.unlink(tempPath, (unlinkErr) => {
          if (unlinkErr) {
            console.warn('Warning: Could not delete temporary file:', unlinkErr);
          }
        });
        
        if (readErr) {
          return reject(readErr);
        }
        
        resolve(buffer);
      });
    });
  });
}

// Keep the old function for backward compatibility if needed
function textToSpeech(text, filename = 'output.mp3') {
  const outputPath = path.join(__dirname, '..', 'responses', filename);
  const gtts = new gTTS(text, 'en');
  return new Promise((resolve, reject) => {
    gtts.save(outputPath, function (err) {
      if (err) return reject(err);
      resolve(outputPath);
    });
  });
}

module.exports = { textToSpeech, textToSpeechBuffer };
