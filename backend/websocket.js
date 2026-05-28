const WebSocket = require('ws');
const url = require('url');

let wss;
const clients = new Map(); // Maps student_number (string) to ws client

const initWebSocket = (server) => {
  wss = new WebSocket.Server({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const parsedUrl = url.parse(request.url, true);
    if (parsedUrl.pathname === '/ws') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    } else {
      socket.destroy();
    }
  });

  wss.on('connection', (ws, request) => {
    const parsedUrl = url.parse(request.url, true);
    const studentNumber = parsedUrl.query.studentNumber;

    if (studentNumber) {
      clients.set(studentNumber, ws);
      console.log(`[WebSocket] Connected client for Student Number: ${studentNumber}`);
    }

    ws.on('close', () => {
      if (studentNumber) {
        clients.delete(studentNumber);
        console.log(`[WebSocket] Disconnected client for Student Number: ${studentNumber}`);
      }
    });

    ws.on('error', (error) => {
      console.error(`[WebSocket] Error for Student Number ${studentNumber}:`, error);
    });
  });
};

const sendToStudent = (studentNumber, data) => {
  if (!studentNumber) return false;
  const ws = clients.get(studentNumber.toString());
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    console.log(`[WebSocket] Sent real-time notification to Student ${studentNumber}`);
    return true;
  }
  console.log(`[WebSocket] Client ${studentNumber} not connected or not open`);
  return false;
};

/**
 * Broadcast a payload to ALL connected WebSocket clients.
 * Used for ML forecast updates that any connected officer should receive.
 */
const broadcast = (data) => {
  let count = 0;
  const payload = JSON.stringify(data);
  clients.forEach((ws, studentNumber) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
      count++;
    }
  });
  console.log(`[WebSocket] Broadcast sent to ${count} connected client(s)`);
  return count;
};

module.exports = {
  initWebSocket,
  sendToStudent,
  broadcast,
};
