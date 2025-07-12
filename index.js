const express = require('express');
const app = express();
const path = require('path');
const http = require('http').createServer(app);
const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const { saveSession } = require('./lib/sessionStore');
const sessionRoutes = require('./routes/sessionRoutes');

require('dotenv').config();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(sessionRoutes);

// Page d’accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Démarrer une session via QR
app.get('/start-session', async (req, res) => {
    const { state, saveCreds } = await useMultiFileAuthState(`sessions/anon`);
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'open') {
            await saveSession(sock.user.id.split(':')[0], sock.user.id);
            console.log('✅ Connecté avec', sock.user.id);
        } else if (connection === 'close') {
            console.log('❌ Déconnecté');
        }
    });

    sock.ev.on('creds.update', saveCreds);
    res.send('QR généré dans la console.');
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`🌐 Serveur sur http://localhost:${PORT}`);
});