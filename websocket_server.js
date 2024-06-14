const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors({
    origin: "*", // Allow all origins
    methods: ["GET", "POST"]
}));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*", // Allow all origins
        methods: ["GET", "POST"]
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', (reason) => {
        console.log('Client disconnected', reason);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    // Example: receiving data from client and broadcasting to all clients
    socket.on('update', (data) => {
        console.log('Received update:', data);
        io.emit('FromAPI', data);
    });

    setInterval(() => {
        const testData = {
            header: 'Test Header',
            text: 'Test text data',
            data: [
                {
                    id: Math.floor(Math.random() * 10) + 1, // Random int between 1 and 10
                    value: Math.floor(Math.random() * 100) + 1 // Random int between 1 and 100
                }
            ]
        };
        io.emit('FromAPI', testData);
    }, 1500);
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`WebSocket server is running on port ${PORT}`);
});
