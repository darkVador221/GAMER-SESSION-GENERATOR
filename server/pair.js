const express = require('express');
const router = express.Router();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const SessionManager = require('../core/SessionManager');
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pair.html'));
});

router.get('/api/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });

    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.once('ready', async () => {
        try {
            const code = await client.requestPairingCode(number);
            return res.json({ code });
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    });

    client.initialize();
});

module.exports = router;