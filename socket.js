// socket.js
const http = require('http');
const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server);
    io.on('connection', (socket) => {
        console.log('A user connected: ' + socket.id);
    });
};

const getSocket = () => {
    if (!io) {
        throw new Error("Socket.io is not initialized");
    }
    return io;
};

module.exports = { initSocket, getSocket };
