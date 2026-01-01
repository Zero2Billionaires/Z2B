import React, { useState, useEffect, useRef } from 'react';
import './AICoachSection.css';

const AICoachSection = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load active session on component mount
  useEffect(() => {
    loadActiveSession();
  }, []);

  const loadActiveSession = async () => {
    try {
      // TODO: Get actual user ID from auth context
      const userId = 'temp-user-id';
      const response = await fetch(`http://localhost:5000/api/coach/check-in/active/${userId}`);

      if (response.ok) {
        const session = await response.json();
        if (session) {
          setSessionId(session.sessionId);
          setMessages(session.conversationLog || []);
        }
      }
    } catch (error) {
      console.error('Error loading active session:', error);
    }
  };

  const startCheckIn = async (sessionType = 'daily') => {
    try {
      setIsLoading(true);
      // TODO: Get actual user ID from auth context
      const userId = 'temp-user-id';

      const response = await fetch('http://localhost:5000/api/coach/check-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, sessionType }),
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session.sessionId);
        setUserStats(data.user);
        setMessages(data.session.conversationLog || []);
      }
    } catch (error) {
      console.error('Error starting check-in:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Add user message to chat immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);

    try {
      // TODO: Get actual user ID from auth context
      const userId = 'temp-user-id';

      const response = await fetch('http://localhost:5000/api/coach/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userId,
          message: userMessage,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Add coach response
        setMessages(prev => [...prev, {
          role: 'coach',
          content: data.response,
          timestamp: new Date(),
          scripture: data.scripture
        }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="ai-coach-section">
      <div className="ai-coach-header">
        <h2>🤖 Your AI Legacy Coach</h2>
        {userStats && (
          <div className="user-stats">
            <span className="stat">🔥 {userStats.checkInStreak} day streak</span>
            <span className="stat">📊 Stage: {userStats.currentStage}</span>
            <span className="stat">🎯 Focus: {userStats.currentFocusLeg}</span>
          </div>
        )}
      </div>

      {!sessionId ? (
        <div className="check-in-prompt">
          <h3>Ready to build your legacy today?</h3>
          <p>Start your coaching session and let's strengthen your Four Legs.</p>
          <div className="check-in-buttons">
            <button
              className="btn btn-primary"
              onClick={() => startCheckIn('daily')}
              disabled={isLoading}
            >
              Daily Check-In
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => startCheckIn('weekly')}
              disabled={isLoading}
            >
              Weekly Review
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => startCheckIn('monthly')}
              disabled={isLoading}
            >
              Monthly Assessment
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="chat-container">
            <div className="messages-list">
              {messages.map((msg, index) => (
                <div key={index} className={`message message-${msg.role}`}>
                  <div className="message-header">
                    <span className="message-role">
                      {msg.role === 'coach' ? '🤖 AI Coach' :
                       msg.role === 'user' ? '👤 You' : '💡 System'}
                    </span>
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                  {msg.scripture && (
                    <div className="scripture-card">
                      <div className="scripture-reference">{msg.scripture.reference}</div>
                      <div className="scripture-verse">"{msg.scripture.verse}"</div>
                      <div className="scripture-application">{msg.scripture.application}</div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="message message-coach">
                  <div className="message-header">
                    <span className="message-role">🤖 AI Coach</span>
                  </div>
                  <div className="message-content typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="chat-input-container">
            <textarea
              className="chat-input"
              placeholder="Share your thoughts, wins, or challenges..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              rows={3}
            />
            <button
              className="btn btn-send"
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
            >
              Send
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AICoachSection;
