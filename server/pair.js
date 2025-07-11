const express = require('express');
const router = express.Router();
const { makeid } = require('../core/utils');
const { Client } = require('whatsapp-web.js');
const SessionManager = require('../core/sessionManager');

router.get('/', (req, res) => {
    res.sendFile('pair.html', { root: 'public' });
});

router.get('/api/pair', async (req, res) => {
    const number = req.query.number;
    if (!number) return res.status(400).json({ error: 'Number required' });

    const client = new Client({
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    try {
        const code = await client.requestPairingCode(number);
        res.json({ code });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;