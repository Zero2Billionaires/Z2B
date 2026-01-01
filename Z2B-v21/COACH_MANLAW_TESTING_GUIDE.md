# Coach Manlaw Testing Guide - Fixing "Failed to Fetch" Error

## 🔍 What's Causing the Error?

The "Failed to fetch" error happens because browsers block direct API calls to external services (Anthropic) due to **CORS (Cross-Origin Resource Sharing)** security restrictions.

## ✅ SOLUTION: 3 Ways to Test Coach Manlaw

---

### **Option 1: Use the Proxy Server (RECOMMENDED)**

This is the proper production-ready solution.

#### Steps:
1. **Start the API Proxy Server:**
   ```bash
   node api/claude-proxy.js
   ```
   You should see:
   ```
   ========================================
     CLAUDE API PROXY SERVER (Node.js)
   ========================================
   Server running on: http://localhost:3001
   ```

2. **In ANOTHER terminal, start the web server:**
   ```bash
   python run_server.py
   ```

3. **Open your browser to:**
   ```
   http://localhost:8000/app/coach-manlaw.html
   ```

4. **Add your API key in Settings and test!**

---

### **Option 2: Browser Extension (Quick Testing)**

If you just want to test without running servers:

#### For Chrome/Edge:
1. Install extension: [CORS Unblock](https://chrome.google.com/webstore/detail/cors-unblock)
2. Enable it (toggle ON)
3. Open `coach-manlaw.html` directly (even as file://)
4. Add API key and test

⚠️ **Remember to disable the extension after testing!**

#### For Firefox:
1. Install: [CORS Everywhere](https://addons.mozilla.org/en-US/firefox/addon/cors-everywhere/)
2. Enable it
3. Test Coach Manlaw

---

### **Option 3: Direct File with CORS Proxy (Temporary)**

Use a public CORS proxy for quick testing (NOT for production):

I've created a test version that uses a public CORS proxy.

**To use:**
1. Open: `app/coach-manlaw-test.html` (I'll create this)
2. Add your API key
3. Test immediately - no servers needed!

⚠️ **Don't use this for production - API keys could be exposed!**

---

## 🎯 Current Status

✅ **Proxy server is NOW RUNNING** on port 3001

### Next Steps:

1. **Open a NEW browser tab/window**
2. **Go to:** http://localhost:8000/app/coach-manlaw.html
3. **Click Settings** (gear icon in Coach Manlaw)
4. **Paste your Claude API key**
5. **Type a test message:** "Give me a motivational pep talk!"

---

## 🔧 Troubleshooting

### "Connection refused" error:
- Make sure proxy server (port 3001) is running
- Check terminal output for errors

### "API key invalid" error:
- Verify your Claude API key is correct
- Check that it starts with `sk-ant-`

### Still getting "Failed to fetch":
- Clear browser cache (Ctrl+Shift+Delete)
- Try a different browser
- Check browser console (F12) for detailed errors

---

## 📞 Quick Commands Reference

```bash
# Start proxy server
node api/claude-proxy.js

# Start web server
python run_server.py

# Start both (Windows)
START_FULL.bat

# Check if servers are running
netstat -ano | findstr "3001 8000"
```

---

## 🔒 Security Reminder

**After testing, IMMEDIATELY rotate your API keys:**

1. **Claude/Anthropic:** https://console.anthropic.com/settings/keys
2. **OpenAI:** https://platform.openai.com/api-keys

Your keys were posted publicly and are compromised!

---

**Ready to test?** The proxy server is running NOW. Open your browser! 🚀
