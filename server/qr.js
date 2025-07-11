const { makeid } = require('../core/utils');
const express = require('express');
const router = express.Router();
const { Client } = require('whatsapp-web.js');
const SessionManager = require('../core/sessionManager');

router.get('/', (req, res) => {
    res.sendFile('qr.html', { root: 'public' });
});

router.get('/api/qr', async (req, res) => {
    const client = new Client({
        puppeteer: { headless: true },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    client.on('qr', (qr) => {
        res.json({ qr });
    });

    client.initialize();
});

module.exports = router;