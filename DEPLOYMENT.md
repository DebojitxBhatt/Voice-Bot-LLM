# 🚀 Frontend Deployment Guide

## **Quick Deploy to Render (Recommended)**

1. **Go to Render.com** and create account
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure:**
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variable**: `VITE_API_URL=https://voice-bot-llm-backend.onrender.com`

5. **Deploy!** Your app will be live at `https://your-app-name.onrender.com`

## **Alternative: Deploy to Vercel**

```bash
npm i -g vercel
cd frontend
vercel
```

## **Current Configuration Status**

✅ **Backend**: https://voice-bot-llm-backend.onrender.com (LIVE)  
✅ **Frontend API URL**: Configured for production  
✅ **CORS**: Updated to accept production domains  
✅ **Security**: Headers and validation implemented  

## **Testing Your Deployment**

1. **Test Backend**: https://voice-bot-llm-backend.onrender.com/health
2. **Deploy Frontend** using guide above
3. **Test Voice Recognition** in Chrome/Safari/Edge
4. **Check Console** (F12) for any errors

## **Browser Compatibility**
- ✅ Chrome/Edge/Safari: Full support
- ❌ Firefox: No speech recognition support 