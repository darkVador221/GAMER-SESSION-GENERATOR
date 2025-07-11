const express = require('express');
const { makeid } = require('./gen-id');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res) => {
  const sessionId = makeid(6);
  const sessionFolder = path.join(__dirname, 'sessions', sessionId);

  try {
    if (!fs.existsSync(sessionFolder)) {
      fs.mkdirSync(sessionFolder, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
    const { version } = await fetchLatestBaileysVersion();
    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, p => Buffer.from(p, 'binary')),
      },
      printQRInTerminal: true,
      browser: ['GAMER XMD', 'Chrome', '1.0'],
    });

    sock.ev.on('connection.update', (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        res.send(`<html><body><h2>Scan this QR:</h2><pre>${qr}</pre></body></html>`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('Reconnecting...');
        } else {
          console.log('Session closed.');
        }
      }

      if (connection === 'open') {
        console.log('✅ Session connected!');
        res.send(`<html><body><h2>Session Connected ✅</h2></body></html>`);
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to generate QR session.');
  }
});

module.exports = router;