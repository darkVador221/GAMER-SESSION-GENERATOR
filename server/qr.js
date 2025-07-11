const express = require('express');
const router = express.Router();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const SessionManager = require('../core/SessionManager');
const path = require('path');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/qr.html'));
});

router.get('/api/qr', async (req, res) => {
    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.once('qr', (qr) => {
        return res.json({ qr });
    });

    client.initialize();
});

module.exports = router;