const express = require('express');
const router = express.Router();
const { Client, RemoteAuth } = require('whatsapp-web.js');
const SessionManager = require('../core/sessionManager');
const path = require('path');
const QRCode = require('qrcode');

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/qr.html'));
});

router.get('/api/qr', async (req, res) => {
    const client = new Client({
        puppeteer: { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] },
        authStrategy: new RemoteAuth({
            store: SessionManager,
            backupSyncIntervalMs: 300000
        })
    });

    let responded = false;

    client.on('qr', async (qr) => {
        if (!responded) {
            responded = true;
            res.status(200).json({ qr });
        }
    });

    client.on('auth_failure', () => {
        if (!responded) {
            responded = true;
            res.status(401).json({ error: 'QR Auth Failure' });
        }
    });

    client.on('ready', () => {
        if (!responded) {
            responded = true;
            res.status(400).json({ error: 'Déjà connecté' });
        }
    });

    client.initialize();
});

module.exports = router;