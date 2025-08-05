# Chatbot Assignment

A full-stack chatbot application with voice capabilities, built with React frontend and Node.js backend.

## Features

- 🤖 AI-powered chatbot with LLM integration
- 🎤 Voice-to-text and text-to-speech capabilities
- 💬 Real-time chat interface
- 🎨 Modern React UI with Vite
- 🔧 Express.js backend with CORS support

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

You can check your versions with:
```bash
node --version
npm --version
```

## Project Structure

```
Chatbot-assignment-5aug/
├── backend/          # Node.js Express server
│   ├── config/       # Configuration files
│   ├── routes/       # API routes
│   ├── services/     # Business logic services
│   └── responses/    # Generated audio responses
└── frontend/         # React application
    ├── src/          # Source code
    └── public/       # Static assets
    .env
```

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd Voice-Bot-LLM
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

#### Environment Variables

Create a `.env` file in the backend directory by copying the example file:

```bash
# Navigate to backend directory
cd backend

# Copy the example environment file
cp .env.example .env
```

**File Location**: Place the `.env` file in the `backend/` directory (same level as `package.json`)

Then edit the `.env` file and add your actual API keys and configuration values.

**Important**: Replace `your_openrouter_api_key_here` with your actual OpenRouter API key. You'll need to:
1. Sign up at [https://openrouter.ai](https://openrouter.ai)
2. Get your API key from [https://openrouter.ai/keys](https://openrouter.ai/keys)
3. Replace the placeholder in your `.env` file with your actual API key

### 3. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
npm install
```

#### Frontend Environment Variables (Optional)

If you need to change the API URL, create a `.env` file by copying the example:

```bash
# Navigate to frontend directory
cd frontend

# Copy the example environment file (optional)
cp .env.example .env
```

**File Location**: Place the `.env` file in the `frontend/` directory (same level as `package.json`)

The default configuration should work for local development.

## Running the Application

### Option 1: Run Backend and Frontend Separately

#### Start the Backend Server

In the backend directory:
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The backend server will start on `http://localhost:3000`

#### Start the Frontend Development Server

In the frontend directory:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

### Option 2: Run Both Simultaneously

You can run both servers in separate terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Accessing the Application

Once both servers are running:

1. Open your browser and navigate to `http://localhost:5173`
2. The chatbot interface should be available
3. The backend API will be accessible at `http://localhost:3000`

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /chat` - Chat endpoint for sending messages
- `GET /responses/:filename` - Access generated audio responses

## Development Scripts

### Backend Scripts
- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon

### Frontend Scripts
- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run preview` - Preview the production build
- `npm run lint` - Run ESLint

## Troubleshooting

### Common Issues

1. **Port already in use**: If port 3000 or 5173 is already in use, you can change the port in the respective configuration files.

2. **CORS errors**: The backend is configured to allow requests from `http://localhost:5173`. If you're using a different port, update the CORS configuration in `backend/index.js`.

3. **Module not found errors**: Make sure you've run `npm install` in both the backend and frontend directories.

4. **Environment variables**: Ensure your `.env` file is properly configured in the backend directory.

### Getting Help

If you encounter any issues:

1. Check that all dependencies are installed
2. Verify that both servers are running
3. Check the browser console and server logs for error messages
4. Ensure your environment variables are properly set

## Technologies Used

- **Frontend**: React, Vite, CSS
- **Backend**: Node.js, Express.js, CORS
- **AI/ML**: LLM integration, Text-to-Speech (gTTS)
- **Development**: Nodemon, ESLint

## License

This project is licensed under the ISC License. 