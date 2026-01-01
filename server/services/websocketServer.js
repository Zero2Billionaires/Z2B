/**
 * WebSocket Server for Real-Time Coach Chat
 * Provides real-time bidirectional communication for Coach ManLaw
 */

import { WebSocketServer } from 'ws';
import { verifyToken } from '../middleware/auth.js';
import { generateCoachResponse } from './aiCoachEngine.js';

let wss = null;
const clients = new Map(); // userId -> WebSocket connection

/**
 * Initialize WebSocket Server
 */
export function initializeWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws/coach' });

  console.log('✅ WebSocket server initialized on /ws/coach');

  wss.on('connection', async (ws, req) => {
    console.log('🔌 New WebSocket connection attempt');

    // Extract token from query string or headers
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers.authorization?.split(' ')[1];

    if (!token) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Authentication required'
      }));
      ws.close();
      return;
    }

    // Verify token
    let user;
    try {
      const decoded = verifyToken(token);
      user = { _id: decoded.id };
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid token'
      }));
      ws.close();
      return;
    }

    // Store connection
    clients.set(user._id.toString(), ws);
    console.log(`✅ User ${user._id} connected via WebSocket`);

    // Send connection confirmation
    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Coach ManLaw real-time chat',
      userId: user._id
    }));

    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📩 Received message:', message);

        await handleMessage(ws, user, message);
      } catch (error) {
        console.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      clients.delete(user._id.toString());
      console.log(`🔌 User ${user._id} disconnected`);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      clients.delete(user._id.toString());
    });
  });

  return wss;
}

/**
 * Handle incoming WebSocket message
 */
async function handleMessage(ws, user, message) {
  const { type, content, sessionId } = message;

  switch (type) {
    case 'chat':
      // Send typing indicator
      ws.send(JSON.stringify({
        type: 'typing',
        isTyping: true
      }));

      try {
        // Generate AI response
        const response = await generateCoachResponse(sessionId, content);

        // Send response
        ws.send(JSON.stringify({
          type: 'message',
          role: 'coach',
          content: response.response,
          scripture: response.scripture,
          timestamp: new Date().toISOString(),
          sessionId: response.sessionId
        }));

        // Stop typing indicator
        ws.send(JSON.stringify({
          type: 'typing',
          isTyping: false
        }));
      } catch (error) {
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to generate response',
          error: error.message
        }));

        ws.send(JSON.stringify({
          type: 'typing',
          isTyping: false
        }));
      }
      break;

    case 'ping':
      ws.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date().toISOString()
      }));
      break;

    default:
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Unknown message type'
      }));
  }
}

/**
 * Send message to specific user
 */
export function sendToUser(userId, message) {
  const ws = clients.get(userId.toString());
  if (ws && ws.readyState === 1) { // 1 = OPEN
    ws.send(JSON.stringify(message));
    return true;
  }
  return false;
}

/**
 * Broadcast message to all connected users
 */
export function broadcast(message) {
  clients.forEach((ws) => {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  });
}

/**
 * Get number of connected clients
 */
export function getConnectedCount() {
  return clients.size;
}

/**
 * Check if user is connected
 */
export function isUserConnected(userId) {
  return clients.has(userId.toString());
}

export default {
  initializeWebSocket,
  sendToUser,
  broadcast,
  getConnectedCount,
  isUserConnected
};
