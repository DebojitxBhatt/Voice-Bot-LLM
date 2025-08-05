# Voice Bot Troubleshooting Guide

## 🚨 Voice Recognition Not Working?

### 1. **Check Browser Compatibility**
- ✅ **Chrome/Edge**: Full support
- ✅ **Safari**: Full support  
- ❌ **Firefox**: Not supported (will show alert)

### 2. **Microphone Permissions**
1. Click the microphone icon in your browser's address bar
2. Select "Allow" for microphone access
3. Refresh the page if needed

### 3. **API Key Setup**
1. Get your API key from: https://openrouter.ai/keys
2. Edit `backend/.env` file
3. Replace `your_openrouter_api_key_here` with your actual API key
4. Restart the backend server

### 4. **HTTPS Requirement**
- Speech recognition requires HTTPS in production
- Works fine on `localhost` for development
- If deploying, ensure you use HTTPS

### 5. **Server Status**
- Backend should be running on: http://localhost:3000
- Frontend should be running on: http://localhost:5173
- Check both are running with: `npm start` in respective folders

### 6. **Common Error Messages**
- "Cannot connect to server" → Backend not running
- "Server error" → Check API key configuration
- "Speech recognition not supported" → Use Chrome/Safari/Edge
- "Speech recognition requires HTTPS" → Use localhost or HTTPS

### 7. **Testing Steps**
1. Open browser console (F12)
2. Check for any error messages
3. Try speaking clearly into microphone
4. Look for "Started listening..." in console

### 8. **Reset Everything**
1. Stop both servers (Ctrl+C)
2. Clear browser cache
3. Restart both servers
4. Refresh browser page 