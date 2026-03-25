import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./YoutubeAIChatHeader.css";
import axios from 'axios';

export default function YoutubeAIChatHeader() {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  // Correctly declare async function
  const handleStartChat = async () => {
    if (!url) {
      console.warn("URL is empty");
      return;
    }

    try {
      const response = await axios.post('http://127.0.0.1:1212/link', { url });
      console.log('Response:', response.data);

      // Navigate after successful response
      navigate("/next", { state: { videoUrl: url } });
    } catch (error) {
      console.error('Error posting data:', error);
    }
  };

  return (
    <div className="header-container">
      {/* Animated background blobs */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>
      <div className="bg-blob blob-3"></div>

      <div className="glass-card">
        <div className="header-logo">
          <div className="play-icon">▶</div>
          <h1>YouTube AI Chat</h1>
        </div>
        
        <p className="header-subtitle">
          Paste any YouTube video link and start chatting instantly with AI. 
          Our smart assistant helps you interact with video content in real time.
        </p>

        <div className="header-input-container">
          <input
            type="url"
            className="styled-input"
            placeholder="Paste YouTube URL here..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
          />
          <button className="primary-btn" onClick={handleStartChat}>
            Start Chat
          </button>
        </div>

        <p className="header-footer">
          Works with public YouTube links only. No login required.
        </p>
      </div>
    </div>
  );
}