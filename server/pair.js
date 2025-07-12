const express = require('express');
const router = express.Router();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const SessionManager = require('../core/sessionManager');
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pair.html'));
});

router.get('/api/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });

    const client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('ready', async () => {
        try {
            const code = await client.requestPairingCode(number);
            return res.status(200).json({ code });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

    client.on('auth_failure', (msg) => {
        console.error("Échec d'authentification :", msg);
        return res.status(401).json({ error: "Échec d'authentification" });
    });

    client.initialize();
});

module.exports = router;