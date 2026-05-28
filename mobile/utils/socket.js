/**
 * socket.js — singleton WebSocket client for the mobile app.
 */
import { BASE_URL } from '../config';

let _socket = null;
let reconnectTimer = null;
const gateStatusListeners = new Set();
const subscribedEventIds = new Set();

const getWsUrl = () => `${BASE_URL.replace(/^http/i, 'ws')}/gate-ws`;

const notifyGateStatus = (payload) => {
  gateStatusListeners.forEach((listener) => {
    try {
      listener(payload);
    } catch (error) {
      console.warn('[WS] Listener error:', error?.message || error);
    }
  });
};

const sendJson = (data) => {
  if (!_socket || _socket.readyState !== WebSocket.OPEN) return;
  _socket.send(JSON.stringify(data));
};

const resubscribeAll = () => {
  subscribedEventIds.forEach((eventId) => {
    sendJson({ type: 'subscribe', eventId });
  });
};

const connectSocket = () => {
  if (_socket && (_socket.readyState === WebSocket.OPEN || _socket.readyState === WebSocket.CONNECTING)) {
    return _socket;
  }

  _socket = new WebSocket(getWsUrl());

  _socket.onopen = () => {
    console.log('[WS] Connected');
    resubscribeAll();
  };

  _socket.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === 'gate:status') {
        notifyGateStatus(message.payload);
      }
    } catch (error) {
      console.warn('[WS] Invalid message received');
    }
  };

  _socket.onerror = () => {
    console.warn('[WS] Connection error');
  };

  _socket.onclose = () => {
    console.log('[WS] Disconnected');
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      connectSocket();
    }, 2000);
  };

  return _socket;
};

export const getSocket = () => connectSocket();

export const subscribeToEvent = (eventId) => {
  if (!eventId) return;
  const eventIdStr = String(eventId);
  subscribedEventIds.add(eventIdStr);
  connectSocket();
  sendJson({ type: 'subscribe', eventId: eventIdStr });
};

export const unsubscribeFromEvent = (eventId) => {
  if (!eventId) return;
  const eventIdStr = String(eventId);
  subscribedEventIds.delete(eventIdStr);
  sendJson({ type: 'unsubscribe', eventId: eventIdStr });
};

export const addGateStatusListener = (listener) => {
  if (!listener) return;
  gateStatusListeners.add(listener);
};

export const removeGateStatusListener = (listener) => {
  if (!listener) return;
  gateStatusListeners.delete(listener);
};
