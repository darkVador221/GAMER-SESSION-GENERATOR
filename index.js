const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const pairRoute = require('./server/pair');
const sessionManager = require('./core/sessionManager');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/pair', pairRoute);

// Route vers la page QR Code
app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'qr.html'));
});

// Page principale (accueil)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'main.html'));
});

// Statique
app.use('/public', express.static(path.join(__dirname, 'public')));

// WebSocket pour QR dynamique
const { startQRSession } = require('./server/qr');
io.on('connection', async (socket) => {
    console.log('🟢 Nouveau client connecté au WebSocket');

    await startQRSession(socket); // QR dynamique avec Baileys

    socket.on('disconnect', () => {
        console.log('🔴 Client déconnecté du WebSocket');
    });
});

// Port
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`🚀 GAMER-XMD is live on port ${PORT}`);
});