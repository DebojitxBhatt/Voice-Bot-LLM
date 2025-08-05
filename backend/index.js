// Load environment variables
import 'dotenv/config';

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS - Allow all origins for now to fix the connection issue
app.use(cors({
  origin: true,
  credentials: true,
  optionsSuccessStatus: 200
}));

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

app.use(bodyParser.json({ limit: '10mb' }));

import chatRoutes from './routes/chat.js';
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
