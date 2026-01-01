# 🎤 ZYNTH Voice Cloning Backend Setup Guide

## Self-Hosted Coqui TTS - No Third-Party APIs Required!

---

## ✅ Prerequisites

1. **Python 3.9 or higher**
   - Check: `python --version`
   - Download: https://www.python.org/downloads/

2. **At least 4GB RAM** (8GB recommended)

3. **5GB free disk space** (for TTS models)

4. **(Optional) NVIDIA GPU** - For 10x faster generation
   - Install CUDA: https://developer.nvidia.com/cuda-downloads

5. **(Optional) ffmpeg** - For better audio conversion
   - Windows: https://ffmpeg.org/download.html
   - Mac: `brew install ffmpeg`
   - Linux: `sudo apt install ffmpeg`

---

## 🚀 Installation Steps

### Step 1: Navigate to Backend Folder
```bash
cd C:\Users\Manana\Z2B\Z2B-v21\app\backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

**⏳ This will take 5-10 minutes** - Coqui TTS downloads ~2GB of models.

### Step 4: (Optional) Install GPU Support
If you have an NVIDIA GPU:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### Step 5: Run the Server
```bash
python server.py
```

**First run takes 2-5 minutes** while the TTS model loads.

You should see:
```
╔══════════════════════════════════════════════════════════╗
║        🎤 ZYNTH Voice Cloning Backend Server 🎤         ║
╚══════════════════════════════════════════════════════════╝

✅ Server ready to clone voices!
📍 Backend URL: http://localhost:5000
🚀 Starting Flask server...
```

---

## 🧪 Testing the Backend

### Test 1: Health Check
Open browser and visit:
```
http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "tts_ready": true,
  "timestamp": "2025-01-XX..."
}
```

### Test 2: Test TTS (No Voice Cloning)
```bash
curl -X POST http://localhost:5000/api/tts/test \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello, this is a test!"}'
```

This will download a `test_speech.wav` file.

---

## 🎯 Connecting ZYNTH to Backend

The backend is now running at: **http://localhost:5000**

ZYNTH will automatically connect when you:
1. Open ZYNTH in your browser
2. Record your 30-minute voice sample
3. Create voice profile
4. Switch to "Cloned Voice Mode"
5. Type text and click "Generate Speech"

✅ **That's it!** Your voice will be cloned!

---

## 📊 Performance Expectations

| Hardware | Generation Speed |
|----------|-----------------|
| CPU Only | ~30 seconds for 10 words |
| GPU (NVIDIA) | ~3 seconds for 10 words |

**Tip:** Use GPU for real-time performance!

---

## 🔧 Troubleshooting

### Error: "TTS model not loaded"
- Make sure you ran `pip install TTS`
- Wait for first-time model download to complete
- Check console for error messages

### Error: "No module named 'TTS'"
```bash
pip install TTS
```

### Error: Port 5000 already in use
Change port in `server.py` line 283:
```python
app.run(port=5001)  # Use different port
```

### Audio quality is poor
- Install ffmpeg for better audio conversion
- Use WAV or MP3 format instead of WebM
- Record 30+ minutes of clear audio

### Generation is slow
- Use GPU (10x faster)
- Reduce text length
- Use shorter voice samples (1-5 minutes works too)

---

## 🔐 Security Notes

- ✅ **All data stays on YOUR server** - no third parties
- ✅ **Voice recordings never leave your machine**
- ✅ **100% self-hosted and private**
- ⚠️ **Don't expose server to internet without authentication**

---

## 🚀 Production Deployment (Optional)

For production use with multiple users:

1. **Use Gunicorn** (better than Flask's dev server):
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 server:app
```

2. **Add authentication** (protect your API)

3. **Use HTTPS** (for secure connections)

4. **Add rate limiting** (prevent abuse)

---

## 📝 API Endpoints

### POST /api/tts/generate
Generate speech with cloned voice
```json
{
  "text": "Text to convert",
  "voice_sample": "base64_encoded_audio",
  "language": "en"
}
```

### GET /health
Check server status

### POST /api/tts/test
Test TTS without voice cloning

### POST /api/cleanup
Delete old temporary files

---

## 🎉 You're All Set!

Your self-hosted voice cloning system is ready!

**No API keys needed • No monthly fees • 100% yours!**

For support: Check server console logs for detailed error messages.
