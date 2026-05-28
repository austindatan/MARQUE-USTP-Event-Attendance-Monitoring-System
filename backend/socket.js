// socket.js — holds the WebSocketServer instance as a singleton
let _wsServer = null;

const setWSServer = (wsServer) => { _wsServer = wsServer; };
const getWSServer = () => _wsServer;

module.exports = { setWSServer, getWSServer };
