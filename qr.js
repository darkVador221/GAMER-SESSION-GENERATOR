const express = require('express');
const { makeid } = require('./gen-id');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const QRCode = require('qrcode');
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
        res.send(`
          <html>
            <body style="background-color:#000;color:#0f0;text-align:center;">
              <h2>📲 Scanne ce QR Code :</h2>
              <pre>${qr}</pre>
            </body>
          </html>
        `);
      }

      if (connection === 'open') {
        console.log('✅ Session connected!');
        res.send(`<html><body><h2>Session Connected ✅</h2></body></html>`);
      }

      if (connection === 'close') {
        const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        if (shouldReconnect) {
          console.log('🔄 Tentative de reconnexion...');
        } else {
          console.log('❌ Session terminée.');
        }
      }
    });

    sock.ev.on('creds.update', saveCreds);

  } catch (err) {
    console.error('❌ Erreur dans /qr :', err);
    res.status(500).send('❌ Échec de génération du QR.');
  }
});

// === Route /qr-code pour qr.html ===
router.get('/qr-code', async (req, res) => {
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
      browser: ['GAMER XMD', 'Chrome', '1.0'],
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { qr } = update;

      if (qr) {
        try {
          const qrImage = await QRCode.toDataURL(qr);
          return res.json({ qr: qrImage });
        } catch (err) {
          return res.status(500).json({ error: 'Erreur QR' });
        }
      }
    });

  } catch (err) {
    console.error('❌ Erreur dans /qr-code :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;