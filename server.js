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
    server.use(cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }));

    const httpServer = http.createServer(server);
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:3000",
            methods: ["GET", "POST"]
        }
    });

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
                        id: Math.floor(Math.random() * 10) + 1, // Random int between 1 and 10
                        value: Math.floor(Math.random() * 100) + 1 // Random int between 1 and 100
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
