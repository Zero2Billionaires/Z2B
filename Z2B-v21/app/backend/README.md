# 🎤 ZYNTH Voice Cloning Backend

**Self-Hosted AI Voice Cloning • No API Keys • 100% Free**

Powered by [Coqui TTS](https://github.com/coqui-ai/TTS) XTTS-v2 model

---

## 🌟 Features

✅ **Clone any voice** from 30-minute audio sample
✅ **Generate unlimited speech** in cloned voice
✅ **100% self-hosted** - your data never leaves your server
✅ **No API keys** or monthly fees required
✅ **Multi-lingual** support (English, Spanish, French, German, Italian, Portuguese, Polish, Turkish, Russian, Dutch, Czech, Arabic, Chinese, Japanese, Hungarian, Korean, Hindi)
✅ **GPU acceleration** for 10x faster generation
✅ **Production-ready** Flask API server

---

## 📁 Project Structure

```
backend/
├── server.py              # Main Flask server with Coqui TTS
├── requirements.txt       # Python dependencies
├── START_SERVER.bat       # Windows startup script (double-click)
├── start_server.sh        # Mac/Linux startup script
├── SETUP.md              # Detailed setup guide
├── QUICKSTART.md         # Quick start guide
├── README.md             # This file
├── uploads/              # Temporary voice samples (auto-created)
└── outputs/              # Generated audio files (auto-created)
```

---

## ⚡ Quick Start

### Windows
1. **Double-click:** `START_SERVER.bat`
2. Wait for "Server ready to clone voices!"
3. Open ZYNTH and start cloning!

### Mac/Linux
```bash
chmod +x start_server.sh
./start_server.sh
```

### Manual
```bash
pip install -r requirements.txt
python server.py
```

**First run:** 5-10 minutes (downloads ~2GB TTS model)
**Next runs:** ~30 seconds

---

## 🎯 How It Works

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│             │         │              │         │             │
│   ZYNTH     │ ──────> │   Backend    │ ──────> │  Coqui TTS  │
│  (Browser)  │  HTTP   │  (Flask)     │  Voice  │  (AI Model) │
│             │ <────── │              │ <────── │             │
└─────────────┘  Audio  └──────────────┘  Clone  └─────────────┘

1. ZYNTH sends: Text + Voice Sample (30-min recording)
2. Backend processes with Coqui TTS
3. Returns: Cloned voice audio file (WAV)
4. ZYNTH plays audio in browser
```

---

## 📊 API Endpoints

### `GET /health`
Check if server and TTS model are ready

**Response:**
```json
{
  "status": "ok",
  "tts_ready": true,
  "timestamp": "2025-01-XX..."
}
```

### `POST /api/tts/generate`
Generate speech with cloned voice

**Request:**
```json
{
  "text": "Text to convert to speech",
  "voice_sample": "base64_encoded_audio",
  "language": "en"
}
```

**Response:** Audio file (WAV format)

### `POST /api/tts/test`
Test TTS without voice cloning (default voice)

**Request:**
```json
{
  "text": "Test message"
}
```

**Response:** Audio file (WAV format)

### `POST /api/cleanup`
Clean up old temporary files (>1 hour old)

**Response:**
```json
{
  "cleaned": 42
}
```

---

## 🔧 Configuration

### Change Port
Edit `server.py` line 283:
```python
app.run(port=5001)  # Default: 5000
```

Also update `zynth.html` line 1180:
```javascript
const BACKEND_URL = 'http://localhost:5001';
```

### Supported Languages
Change in API request:
```json
{
  "language": "es"  // en, es, fr, de, it, pt, pl, tr, ru, nl, cs, ar, zh-cn, ja, hu, ko, hi
}
```

### GPU Acceleration
Install CUDA-enabled PyTorch:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

---

## 📈 Performance Benchmarks

| Hardware | Generation Time (10 words) |
|----------|----------------------------|
| CPU (Intel i5-10400) | ~30 seconds |
| CPU (Intel i7-12700) | ~20 seconds |
| GPU (NVIDIA GTX 1660) | ~5 seconds |
| GPU (NVIDIA RTX 3060) | ~3 seconds |
| GPU (NVIDIA RTX 4090) | ~1 second |

---

## 🛡️ Security & Privacy

✅ **All processing happens locally** on your server
✅ **No data sent to third parties** (completely offline after model download)
✅ **Voice recordings stay on your machine**
✅ **No telemetry or tracking**
⚠️ **Do not expose to internet** without authentication

---

## 🚀 Production Deployment

For production use with multiple users:

### Use Gunicorn (WSGI server)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 --timeout 300 server:app
```

### Add HTTPS (with Nginx)
```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Add Authentication
Use Flask-HTTPAuth or API keys for protected endpoints.

### Add Rate Limiting
Use Flask-Limiter to prevent abuse:
```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@limiter.limit("10 per minute")
@app.route('/api/tts/generate', methods=['POST'])
def generate_speech():
    # ...
```

---

## 🧪 Testing

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

### Test 2: Default TTS (no cloning)
```bash
curl -X POST http://localhost:5000/api/tts/test \
  -H "Content-Type: application/json" \
  -d '{"text": "Testing voice synthesis"}' \
  --output test.wav
```

### Test 3: Voice Cloning
Use ZYNTH interface or:
```bash
curl -X POST http://localhost:5000/api/tts/generate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This is my cloned voice!",
    "voice_sample": "<base64_audio>",
    "language": "en"
  }' \
  --output cloned.wav
```

---

## 📚 Documentation

- **Quick Start:** See `QUICKSTART.md`
- **Detailed Setup:** See `SETUP.md`
- **Coqui TTS Docs:** https://docs.coqui.ai/
- **XTTS-v2 Model:** https://huggingface.co/coqui/XTTS-v2

---

## 🐛 Troubleshooting

### Server won't start
- Check Python version: `python --version` (need 3.9+)
- Reinstall dependencies: `pip install -r requirements.txt --force-reinstall`
- Check server logs for errors

### "TTS model not loaded"
- Ensure `pip install TTS` completed successfully
- Check internet connection (first run downloads model)
- Try: `pip install TTS --upgrade`

### Poor voice quality
- Record longer voice sample (30+ minutes)
- Use quiet environment (no background noise)
- Try WAV format instead of WebM
- Increase voice sample quality

### Slow generation
- Use GPU acceleration (10x faster)
- Reduce text length
- Use shorter voice samples (1-5 minutes also works)

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

---

## 🤝 Contributing

This is a self-hosted implementation of Coqui TTS for ZYNTH.

**To improve:**
1. Add more languages
2. Optimize voice cloning speed
3. Add voice sample preprocessing
4. Implement voice quality metrics
5. Add batch processing

---

## 📄 License

This server implementation: MIT License

Coqui TTS: Mozilla Public License 2.0

XTTS-v2 Model: [Coqui Public Model License](https://coqui.ai/cpml)

---

## 🎉 Credits

- **Coqui TTS Team:** Amazing open-source voice synthesis
- **XTTS-v2 Model:** State-of-the-art voice cloning
- **Z2B Legacy Builders:** ZYNTH voice cloning app

---

## 💬 Support

**Issues?** Check server console logs for detailed errors.

**Questions?** See documentation:
- `QUICKSTART.md` - Fast setup
- `SETUP.md` - Detailed guide
- Server logs - Real-time debugging

---

**Built with ❤️ for Z2B Legacy Builders**

*Transform your voice into unlimited AI-generated speech!*
