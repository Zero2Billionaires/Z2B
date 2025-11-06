"""
ZYNTH Voice Cloning Backend Server
Powered by Coqui TTS (Self-Hosted, No Third-Party APIs)

This server provides voice cloning capabilities using Coqui TTS XTTS-v2 model.
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import base64
import tempfile
import time
from datetime import datetime
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for browser access

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'outputs'
Path(UPLOAD_FOLDER).mkdir(exist_ok=True)
Path(OUTPUT_FOLDER).mkdir(exist_ok=True)

# Global TTS model (loaded once for performance)
tts_model = None

def initialize_tts():
    """Initialize Coqui TTS model (XTTS-v2)"""
    global tts_model

    try:
        from TTS.api import TTS

        logger.info("[*] Loading Coqui TTS XTTS-v2 model...")
        logger.info("This may take a few minutes on first run (downloading ~2GB model)...")

        # Load XTTS-v2 (best quality, multi-lingual voice cloning)
        tts_model = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2")

        # Use GPU if available
        if tts_model.is_cuda_available:
            tts_model = tts_model.to("cuda")
            logger.info("[+] Using GPU acceleration")
        else:
            logger.info("[+] Using CPU (GPU recommended for faster generation)")

        logger.info("[+] Coqui TTS model loaded successfully!")
        return True

    except ImportError:
        logger.error("[-] Coqui TTS not installed! Run: pip install TTS")
        return False
    except Exception as e:
        logger.error(f"[-] Error loading TTS model: {e}")
        return False

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Check if backend is running and TTS is ready"""
    return jsonify({
        'status': 'ok',
        'tts_ready': tts_model is not None,
        'timestamp': datetime.now().isoformat()
    })

# Voice generation endpoint
@app.route('/api/tts/generate', methods=['POST'])
def generate_speech():
    """
    Generate speech using cloned voice

    Request body:
    {
        "text": "Text to convert to speech",
        "voice_sample": "base64 encoded audio file",
        "language": "en" (optional, default: en)
    }
    """
    try:
        if tts_model is None:
            return jsonify({'error': 'TTS model not loaded'}), 500

        # Get request data
        data = request.get_json()
        text = data.get('text', '')
        voice_sample_b64 = data.get('voice_sample', '')
        language = data.get('language', 'en')

        if not text:
            return jsonify({'error': 'No text provided'}), 400

        if not voice_sample_b64:
            return jsonify({'error': 'No voice sample provided'}), 400

        logger.info(f"[*] Generating speech: '{text[:50]}...'")

        # Decode voice sample from base64
        if ',' in voice_sample_b64:
            voice_sample_b64 = voice_sample_b64.split(',')[1]

        voice_sample_bytes = base64.b64decode(voice_sample_b64)

        # Save voice sample temporarily
        voice_file = os.path.join(UPLOAD_FOLDER, f'voice_sample_{int(time.time())}.webm')
        with open(voice_file, 'wb') as f:
            f.write(voice_sample_bytes)

        # Convert webm to wav if needed (Coqui TTS works best with WAV)
        wav_file = convert_to_wav(voice_file)

        # Generate output filename
        output_file = os.path.join(OUTPUT_FOLDER, f'generated_{int(time.time())}.wav')

        # Generate speech with cloned voice
        logger.info("[*] Cloning voice and generating speech...")
        start_time = time.time()

        tts_model.tts_to_file(
            text=text,
            file_path=output_file,
            speaker_wav=wav_file,
            language=language
        )

        generation_time = time.time() - start_time
        logger.info(f"[+] Speech generated in {generation_time:.2f} seconds")

        # Clean up temporary files
        try:
            os.remove(voice_file)
            if wav_file != voice_file:
                os.remove(wav_file)
        except:
            pass

        # Return audio file
        return send_file(
            output_file,
            mimetype='audio/wav',
            as_attachment=True,
            download_name=f'zynth_cloned_speech_{int(time.time())}.wav'
        )

    except Exception as e:
        logger.error(f"[-] Error generating speech: {e}")
        return jsonify({'error': str(e)}), 500

# Quick test endpoint (no voice sample needed)
@app.route('/api/tts/test', methods=['POST'])
def test_tts():
    """Test TTS with default voice (no cloning)"""
    try:
        if tts_model is None:
            return jsonify({'error': 'TTS model not loaded'}), 500

        data = request.get_json()
        text = data.get('text', 'Hello, this is a test of the text to speech system.')

        output_file = os.path.join(OUTPUT_FOLDER, f'test_{int(time.time())}.wav')

        logger.info(f"[*] Testing TTS: '{text}'")

        # Generate with default voice (faster, no cloning)
        tts_model.tts_to_file(
            text=text,
            file_path=output_file
        )

        logger.info("[+] Test speech generated")

        return send_file(
            output_file,
            mimetype='audio/wav',
            as_attachment=True,
            download_name='test_speech.wav'
        )

    except Exception as e:
        logger.error(f"[-] Error in test: {e}")
        return jsonify({'error': str(e)}), 500

def convert_to_wav(input_file):
    """Convert audio file to WAV format using ffmpeg (if available)"""
    try:
        import subprocess

        output_file = input_file.rsplit('.', 1)[0] + '.wav'

        # Try to convert using ffmpeg
        subprocess.run([
            'ffmpeg', '-i', input_file,
            '-ar', '22050',  # Sample rate
            '-ac', '1',      # Mono
            output_file
        ], check=True, capture_output=True)

        logger.info(f"[+] Converted {input_file} to WAV")
        return output_file

    except (subprocess.CalledProcessError, FileNotFoundError):
        # ffmpeg not available or conversion failed
        # Return original file and hope for the best
        logger.warning("[!] ffmpeg not found, using original audio format")
        return input_file

# Cleanup old files periodically
@app.route('/api/cleanup', methods=['POST'])
def cleanup_files():
    """Clean up old temporary files"""
    try:
        import glob

        # Delete files older than 1 hour
        current_time = time.time()
        count = 0

        for folder in [UPLOAD_FOLDER, OUTPUT_FOLDER]:
            for filepath in glob.glob(os.path.join(folder, '*')):
                if os.path.isfile(filepath):
                    file_age = current_time - os.path.getmtime(filepath)
                    if file_age > 3600:  # 1 hour
                        os.remove(filepath)
                        count += 1

        logger.info(f"[*] Cleaned up {count} old files")
        return jsonify({'cleaned': count})

    except Exception as e:
        logger.error(f"[-] Cleanup error: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("""
    ==============================================================

            ZYNTH Voice Cloning Backend Server

                  Powered by Coqui TTS (XTTS-v2)

    ==============================================================
    """)

    print("\n[*] Initializing Coqui TTS model...\n")

    if initialize_tts():
        print("\n[+] Server ready to clone voices!\n")
        print("[*] Backend URL: http://localhost:5000")
        print("[*] Health check: http://localhost:5000/health")
        print("\n[*] Starting Flask server...\n")

        # Run Flask server
        app.run(
            host='0.0.0.0',  # Allow external connections
            port=5000,
            debug=False,  # Set to True for development
            threaded=True  # Handle multiple requests
        )
    else:
        print("\n[-] Failed to initialize TTS model")
        print("\n[*] Setup Instructions:")
        print("   1. Install Coqui TTS: pip install TTS")
        print("   2. Run this server again: python server.py")
