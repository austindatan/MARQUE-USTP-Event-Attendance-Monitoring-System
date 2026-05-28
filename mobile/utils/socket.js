/**
 * socket.js — singleton Socket.IO client for the mobile app.
 *
 * Usage:
 *   import { getSocket } from '../../utils/socket';
 *   const socket = getSocket();
 *   socket.emit('join:event', eventId);
 *   socket.on('gate:status', handler);
 */
import { io } from 'socket.io-client';
import { BASE_URL } from '../config';

let _socket = null;

export const getSocket = () => {
  if (!_socket) {
    _socket = io(BASE_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    _socket.on('connect', () => {
      console.log('[Socket] Connected:', _socket.id);
    });

    _socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });

    _socket.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });
  }
  return _socket;
};
