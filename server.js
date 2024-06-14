const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const next = require('next');
const cors = require('cors');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './src' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    // Configure CORS to allow requests from any origin
    server.use(cors({
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }));

    const httpServer = http.createServer(server);

    // Configure socket.io with CORS settings to allow requests from any origin
    const io = new Server(httpServer, {
        cors: {
            origin: true,
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    let idCounter = 1;

    io.on('connection', (socket) => {
        console.log('New client connected');

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });

        setInterval(() => {
            const testData = {
                header: 'Test Header',
                text: 'Test text data',
                data: [
                    {
                        id: idCounter++ % 10 + 1, // Ensure id is between 1 and 10, cycling through
                        value: Math.round(Math.random() * 100)
                    }
                ]
            };
            io.emit('FromAPI', testData);
        }, 5000);

        socket.on('update', (data) => {
            io.emit('FromAPI', data);
        });
    });

    server.all('*', (req, res) => {
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
