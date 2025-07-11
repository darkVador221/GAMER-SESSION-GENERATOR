const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const SessionManager = require('../core/sessionManager');
const { welcomeMessage } = require('../core/messageTemplates');

// Routes
const qrRoute = require('./qr');
const pairRoute = require('./pair');

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use('/qr', qrRoute);
app.use('/pair', pairRoute);

// API endpoint
app.post('/api/start-session', async (req, res) => {
    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('qr', qr => {
        io.emit('qr', qr);
        res.json({ qr });
    });

    client.on('authenticated', async (session) => {
        const sessionId = await SessionManager.saveSession(session);
        
        // Send welcome message
        client.sendMessage(
            `${session.user.id}@c.us`,
            welcomeMessage(session.user.name)
        );

        res.json({ 
            sessionId,
            message: "Session activée avec succès!"
        });
    });

    client.initialize();
});

// Start server
const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    SessionManager.connect();
});