const express = require('express');
const { Client } = require('whatsapp-web.js');
const SessionManager = require('../core/SessionManager');
const { welcomeMessage } = require('../core/messageTemplates');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static('public'));
app.use(express.json());

// Routes
app.use('/qr', require('./routes/qr.route'));
app.use('/pair', require('./routes/pair.route'));

// Gestion WhatsApp
app.post('/api/start-session', async (req, res) => {
    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('qr', qr => {
        res.json({ qr });
    });

    client.on('authenticated', async (session) => {
        const sessionId = await SessionManager.saveSession(session);
        
        // Envoi message de bienvenue
        client.sendMessage(
            `${session.user.id}@c.us`,
            welcomeMessage(session.user.name)
        );

        res.json({ 
            sessionId,
            message: "Session prête!"
        });
    });

    client.initialize();
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur port ${PORT}`);
    SessionManager.connect();
});
