# ⚡ ZYNTH Voice Cloning - Quick Start Guide

## 🎯 Start Using Voice Cloning in 3 Steps!

### Step 1: Install Python
**Already have Python 3.9+?** Skip to Step 2!

- Download: https://www.python.org/downloads/
- **IMPORTANT:** Check "Add Python to PATH" during installation!

### Step 2: Start the Backend Server
**Windows:**
```
Double-click: START_SERVER.bat
```

**Mac/Linux:**
```bash
cd backend
chmod +x start_server.sh
./start_server.sh
```

**Manual (any OS):**
```bash
cd backend
pip install -r requirements.txt
python server.py
```

### Step 3: Use ZYNTH
1. Open `zynth.html` in your browser
2. Record 30-minute voice sample
3. Create voice profile
4. Switch to "Cloned Voice Mode"
5. Type text → Click "Generate Speech"
6. **Hear your cloned voice!** 🎉

---

## 📊 What Happens on First Run?

| Stage | Time | What's Happening |
|-------|------|------------------|
| Installing Dependencies | 5-10 min | Downloading Coqui TTS (~2GB) |
| Loading TTS Model | 2-5 min | First-time model initialization |
| **Server Ready** | ✅ | Voice cloning active! |

**Next runs:** Server starts in ~30 seconds!

---

## 🎤 Voice Recording Tips

For best cloning results:
- ✅ **30+ minutes** of audio (more = better)
- ✅ **Quiet environment** (no background noise)
- ✅ **Natural speaking** (vary emotions & tones)
- ✅ **Clear pronunciation**
- ❌ Avoid music, echoes, distortion

---

## ⚡ Performance

| Hardware | Speed per 10 words |
|----------|-------------------|
| CPU (Intel i5) | ~30 seconds |
| GPU (NVIDIA) | ~3 seconds |

**Want 10x faster?** Install GPU support:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

## 🔧 Common Issues

### "Python not found"
- Reinstall Python with "Add to PATH" checked
- Restart your computer

### "Port 5000 already in use"
- Another program is using port 5000
- Change port in `server.py` line 283:
  ```python
  app.run(port=5001)  # Use 5001 instead
  ```
- Update `zynth.html` line 1180:
  ```javascript
  const BACKEND_URL = 'http://localhost:5001';
  ```

### "Backend not responding" in ZYNTH
- Make sure `START_SERVER.bat` is running
- Check for errors in server console
- Try browser refresh

### Generation fails
- Check server console for errors
- Make sure you recorded voice sample
- Try shorter text first (5-10 words)

---

## 💡 Pro Tips

1. **Keep server running** while using ZYNTH
2. **Use GPU** for real-time generation
3. **Record longer samples** for better quality
4. **Start with short text** to test first
5. **Check server logs** if anything fails

---

## 🎉 You're Ready!

**Start the server → Open ZYNTH → Clone your voice!**

No API keys • No monthly fees • 100% self-hosted! 🚀
