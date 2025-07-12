const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { MongoStore } = require('@whiskeysockets/baileys');
const { useSingleFileAuthState } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 3000;

const { welcomeMessage } = require('./core/messageTemplates');

// MongoDB store for sessions
const store = MongoStore({
    dbUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Route: QR Session
app.get('/qr', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/qr.html'));
});

// Route: Pairing Code Session
app.get('/pair', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/pair.html'));
});

// API: Génération du QR code
io.on('connection', async (socket) => {
    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: {
            creds: undefined,
            keys: store
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { qr, connection, lastDisconnect } = update;

        if (qr) {
            qrcode.toDataURL(qr, (err, url) => {
                socket.emit('qr', url);
            });
        }

        if (connection === 'open') {
            await sock.sendMessage(sock.user.id, {
                text: welcomeMessage(sock.user)
            });
            console.log('✅ Bot connecté avec succès à WhatsApp');
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔁 Reconnexion...');
                startSock();
            }
        }
    });
});

// API: Génération de code d’appariement
app.get('/api/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });

    const sock = makeWASocket({
        printQRInTerminal: false,
        auth: {
            creds: undefined,
            keys: store
        }
    });

    try {
        const code = await sock.requestPairingCode(number);
        await sock.sendMessage(`${number}@s.whatsapp.net`, {
            text: welcomeMessage({ pushName: 'Utilisateur' })
        });
        return res.json({ code });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});

// Lancement
server.listen(PORT, () => {
    console.log(`🚀 Serveur en ligne : http://localhost:${PORT}`);
});