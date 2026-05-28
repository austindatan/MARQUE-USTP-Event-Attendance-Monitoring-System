// socket.js — holds the Socket.IO instance as a singleton
let _io = null;

const setIO = (io) => { _io = io; };
const getIO = () => _io;

module.exports = { setIO, getIO };
