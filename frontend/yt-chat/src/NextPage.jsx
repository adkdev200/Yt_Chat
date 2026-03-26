import React, { useState, useRef, useEffect } from "react";
import "./NextPage.css";

export default function NextPage() {
  const [messages, setMessages] = useState(() => {
    // Load saved messages from localStorage on initial render
    const saved = localStorage.getItem("yt_chat_messages");
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("yt_chat_messages", JSON.stringify(messages));
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const query = input.trim();
    if (!query || loading) return;

    // Add user message
    const userMessage = { role: "user", content: query };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    // Add an empty AI message placeholder that we'll stream into
    const aiMessageIndex = messages.length + 1; // +1 because we just added user msg
    setMessages((prev) => [...prev, { role: "ai", content: "", streaming: true }]);

    try {
      const response = await fetch("http://127.0.0.1:1212/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Server error");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          const lastMsg = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + chunk,
          };
          return updated;
        });
      }

      // Mark streaming as done
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          streaming: false,
        };
        return updated;
      });
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: `⚠️ Error: ${error.message}`,
          streaming: false,
        };
        return updated;
      });
    }

    setLoading(false);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("yt_chat_messages");
  };

  return (
    <div className="chat-container">
      <div className="chat-card glass">
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>💬 YouTube AI Chat</h2>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.6)",
                  padding: "8px 16px",
                  borderRadius: "20px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255,80,80,0.2)";
                  e.target.style.color = "#ff6b6b";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255,255,255,0.1)";
                  e.target.style.color = "rgba(255,255,255,0.6)";
                }}
              >
                Clear Chat
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <p>✨ Ask anything about the video!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.role}`}>
                <div
                  className={`message-bubble ${msg.role} ${msg.streaming ? "typing" : ""
                    }`}
                >
                  {msg.content}
                  {msg.streaming && <span className="cursor-blink">▊</span>}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form className="chat-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
          />
          <button
            type="submit"
            className="chat-submit-btn"
            disabled={loading || !input.trim()}
          >
            {loading ? "⏳" : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}