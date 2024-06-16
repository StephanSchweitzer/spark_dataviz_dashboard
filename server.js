const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const next = require('next');
const cors = require('cors');
const debug = require('debug')('myapp:server');
const axios = require('axios');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './src' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.use(cors({
        origin: true,
        methods: ["GET", "POST", "OPTIONS", "PUT", "PATCH", "DELETE"],
        credentials: true
    }));

    const httpServer = http.createServer(server);

    // Configure WebSocket server
    const wss = new WebSocket.Server({ server: httpServer });

    wss.on('connection', (ws) => {
        debug('New client connected');
        console.log('New client connected');

        ws.on('message', async (message) => {
            debug('Received message from client:', message);
            console.log('Received message from client:', message);

            // Parse the received message
            let parsedMessage;
            try {
                parsedMessage = JSON.parse(message);
            } catch (err) {
                console.error('Failed to parse message. Error:', err);
                return;
            }

            // Send message to hatespeech_api
            try {
                await axios.post('http://localhost:3002/messages', { message: parsedMessage });
                console.log('Message sent to hatespeech_api');
            } catch (err) {
                console.error('Failed to send message to hatespeech_api. Error:', err);
            }

            // Broadcast message to all clients
            wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        });

        ws.on('close', () => {
            debug('Client disconnected');
            console.log('Client disconnected');
        });

        ws.on('error', (error) => {
            debug('WebSocket error:', error);
            console.error('WebSocket error:', error);
        });
    });

    server.all('*', (req, res) => {
        debug('Handling request for %s', req.url);
        return handle(req, res);
    });

    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
        debug(`Server is running on port ${PORT}`);
        console.log(`Server is running on port ${PORT}`);
    });
});
