import React, { useState } from 'react';
import '../styles/exportshare.css';

const ExportShare = ({ milestoneData, milestoneName, milestoneNumber }) => {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  // Format data as text for sharing
  const formatAsText = () => {
    let text = `🎯 MY ${milestoneName.toUpperCase()} - Z2B Legacy Builders\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;

    if (milestoneData) {
      Object.entries(milestoneData).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          text += `📌 ${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:\n${value}\n\n`;
        } else if (Array.isArray(value) && value.length > 0) {
          text += `📌 ${key.replace(/([A-Z])/g, ' $1').toUpperCase()}:\n`;
          value.forEach((item, index) => {
            text += `  ${index + 1}. ${typeof item === 'object' ? JSON.stringify(item) : item}\n`;
          });
          text += '\n';
        }
      });
    }

    text += `\n🚀 Join me at Z2B Legacy Builders!\n`;
    text += `Transform your life from ZERO to BILLIONAIRE\n`;
    text += `https://www.z2blegacybuilders.co.za`;

    return text;
  };

  // Download as JSON
  const downloadJSON = () => {
    const dataStr = JSON.stringify(milestoneData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Z2B_Milestone${milestoneNumber}_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Download as TXT
  const downloadTXT = () => {
    const text = formatAsText();
    const dataBlob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Z2B_Milestone${milestoneNumber}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Copy to clipboard
  const copyToClipboard = () => {
    const text = formatAsText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  // Share via WhatsApp
  const shareWhatsApp = () => {
    const text = encodeURIComponent(formatAsText());
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  // Share via Facebook
  const shareFacebook = () => {
    const text = encodeURIComponent(`🎯 Just completed Milestone ${milestoneNumber}: ${milestoneName} at Z2B Legacy Builders! 🚀\n\nJoin me on the journey from ZERO to BILLIONAIRE!`);
    const url = `https://www.facebook.com/sharer/sharer.php?u=https://www.z2blegacybuilders.co.za&quote=${text}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Share via Twitter/X
  const shareTwitter = () => {
    const text = encodeURIComponent(`🎯 Just completed Milestone ${milestoneNumber}: ${milestoneName} at @Z2BLegacy! 🚀\n\nTransforming my life from ZERO to BILLIONAIRE!\n\n#Z2BLegacy #Entrepreneurship #WealthBuilding`);
    const url = `https://twitter.com/intent/tweet?text=${text}&url=https://www.z2blegacybuilders.co.za`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Share via LinkedIn
  const shareLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=https://www.z2blegacybuilders.co.za`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  // Copy for TikTok (TikTok doesn't have direct share API)
  const copyForTikTok = () => {
    const text = `🎯 Milestone ${milestoneNumber}: ${milestoneName} ✅\n\n🚀 Building my legacy from ZERO to BILLIONAIRE with Z2B Legacy Builders!\n\n#Z2BLegacy #Entrepreneurship #WealthBuilding #Legacy #Transformation`;
    navigator.clipboard.writeText(text).then(() => {
      alert('✅ Copied for TikTok! Open TikTok and paste in your video caption.');
    });
  };

  // Take screenshot (using html2canvas - will need to install)
  const takeScreenshot = async () => {
    try {
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;

      const element = document.querySelector('.milestone-summary') || document.body;
      const canvas = await html2canvas(element, {
        backgroundColor: '#0f0a08',
        scale: 2,
        logging: false
      });

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Z2B_Milestone${milestoneNumber}_Screenshot_${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
    } catch (error) {
      alert('Screenshot feature requires html2canvas. Please run: npm install html2canvas');
      console.error('Screenshot error:', error);
    }
  };

  // Save to Google Drive (opens Google Drive upload)
  const saveToGoogleDrive = () => {
    downloadJSON();
    alert('💡 File downloaded! You can now upload it to Google Drive manually.');
  };

  return (
    <div className="export-share-container">
      <button
        className="btn-export-share"
        onClick={() => setShowShareMenu(!showShareMenu)}
      >
        {showShareMenu ? '✕ Close' : '📤 Save & Share'}
      </button>

      {showShareMenu && (
        <div className="export-share-menu">
          {/* Download Section */}
          <div className="share-section">
            <h3>💾 Save Locally</h3>
            <div className="share-buttons">
              <button onClick={downloadJSON} className="share-btn">
                <span className="btn-icon">📁</span>
                Download JSON
              </button>
              <button onClick={downloadTXT} className="share-btn">
                <span className="btn-icon">📄</span>
                Download TXT
              </button>
              <button onClick={saveToGoogleDrive} className="share-btn">
                <span className="btn-icon">☁️</span>
                Save to Drive
              </button>
              <button onClick={takeScreenshot} className="share-btn">
                <span className="btn-icon">📸</span>
                Screenshot
              </button>
            </div>
          </div>

          {/* Share on Social Media */}
          <div className="share-section">
            <h3>🌐 Share on Social Media</h3>
            <div className="share-buttons">
              <button onClick={shareWhatsApp} className="share-btn whatsapp">
                <span className="btn-icon">💬</span>
                WhatsApp
              </button>
              <button onClick={shareFacebook} className="share-btn facebook">
                <span className="btn-icon">📘</span>
                Facebook
              </button>
              <button onClick={shareTwitter} className="share-btn twitter">
                <span className="btn-icon">🐦</span>
                Twitter/X
              </button>
              <button onClick={shareLinkedIn} className="share-btn linkedin">
                <span className="btn-icon">💼</span>
                LinkedIn
              </button>
              <button onClick={copyForTikTok} className="share-btn tiktok">
                <span className="btn-icon">🎵</span>
                TikTok
              </button>
            </div>
          </div>

          {/* Copy to Clipboard */}
          <div className="share-section">
            <h3>📋 Copy & Paste</h3>
            <button
              onClick={copyToClipboard}
              className={`share-btn copy-btn ${copied ? 'copied' : ''}`}
            >
              <span className="btn-icon">{copied ? '✅' : '📋'}</span>
              {copied ? 'Copied!' : 'Copy All Text'}
            </button>
          </div>

          {/* Privacy Note */}
          <div className="privacy-note">
            <p>
              🔒 <strong>Privacy:</strong> Your data is saved locally in your browser.
              When you download or share, you control where it goes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportShare;
