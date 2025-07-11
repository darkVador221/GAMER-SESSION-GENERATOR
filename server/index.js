const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');
const SessionManager = require('../core/SessionManager');
const { welcomeMessage } = require('../core/messageTemplates');
const { Client, RemoteAuth } = require('whatsapp-web.js');

// Routes
const healthRoute = require('./health');
const qrRoute = require('./qr');
const pairRoute = require('./pair');

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/qr', qrRoute);
app.use('/pair', pairRoute);
app.use('/health', healthRoute);

// API endpoint
app.post('/api/start-session', async (req, res) => {
    try {
        const client = new Client({
            puppeteer: { 
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            },
            authStrategy: new RemoteAuth({
                store: SessionManager,
                backupSyncIntervalMs: 300000
            })
        });

        client.on('qr', (qr) => {
            io.emit('qr', qr);
            res.json({ qr });
        });

        client.on('authenticated', async (session) => {
            const sessionId = await SessionManager.saveSession(session);
            
            // Send welcome message
            client.sendMessage(
                `${session.user.id}@c.us`,
                welcomeMessage(session.user.pushName || "Utilisateur")
            );

            res.json({ 
                sessionId,
                message: "Session activée avec succès!"
            });
        });

        client.initialize();
    } catch (error) {
        console.error("Erreur démarrage session:", error.message);
        res.status(500).json({ error: "Échec démarrage session" });
    }
});

// Démarrer serveur
const PORT = process.env.PORT || 3000;
http.listen(PORT, async () => {
    console.log(`🌐 Serveur démarré sur port ${PORT}`);
    try {
        await SessionManager.connect();
    } catch (err) {
        console.error("❌ Échec connexion DB - Vérifiez MONGODB_URI dans .env");
    }
});