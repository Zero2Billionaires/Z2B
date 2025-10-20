/**
 * Chat Interface Component
 * Real-time chat with Coach ManLaw AI
 */

import { useState, useEffect, useRef } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    startCheckIn();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startCheckIn = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/coach/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user._id,
          sessionType: 'daily'
        })
      });

      if (!response.ok) throw new Error('Failed to start check-in');

      const data = await response.json();
      setSessionId(data.session.sessionId);

      // Add welcome message
      if (data.session.conversationLog.length > 0) {
        const welcomeMsg = data.session.conversationLog[0];
        setMessages([{
          role: 'coach',
          content: welcomeMsg.content,
          timestamp: welcomeMsg.timestamp
        }]);
      }
    } catch (error) {
      console.error('Error starting check-in:', error);
      setMessages([{
        role: 'system',
        content: 'Welcome to Coach ManLaw! How can I help you today?',
        timestamp: new Date()
      }]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId,
          userId: user._id,
          message: inputMessage
        })
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();

      const coachMessage = {
        role: 'coach',
        content: data.response,
        scripture: data.scripture,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, coachMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'coach' ? '🤵' : msg.role === 'user' ? '👤' : 'ℹ️'}
            </div>
            <div className="message-content">
              <div className="message-text">{msg.content}</div>
              {msg.scripture && (
                <div className="message-scripture">
                  <div className="scripture-reference">
                    📖 {msg.scripture.reference}
                  </div>
                  <div className="scripture-verse">"{msg.scripture.verse}"</div>
                  <div className="scripture-application">
                    💡 {msg.scripture.application}
                  </div>
                </div>
              )}
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="message coach typing">
            <div className="message-avatar">🤵</div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask Coach ManLaw anything about building your legacy..."
          rows="3"
          disabled={loading}
        />
        <button
          className="send-button"
          onClick={sendMessage}
          disabled={!inputMessage.trim() || loading}
        >
          {loading ? '⏳' : '📤'} Send
        </button>
      </div>

      <div className="quick-prompts">
        <button onClick={() => setInputMessage("I want to build my first million. Where do I start?")}>
          💰 Building First Million
        </button>
        <button onClick={() => setInputMessage("How do I overcome limiting beliefs?")}>
          🧠 Mindset Breakthrough
        </button>
        <button onClick={() => setInputMessage("What legacy should I leave?")}>
          🏛️ Legacy Planning
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
