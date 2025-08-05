const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);

// Ensure responses folder exists
const responsePath = path.join(__dirname, 'responses');
if (!fs.existsSync(responsePath)) fs.mkdirSync(responsePath);

// Serve static files from responses directory
app.use('/responses', express.static(path.join(__dirname, 'responses')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'VoiceBot server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
