const express = require('express');
const { makeid } = require('./gen-id');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res) => {
  const phone = req.query.phone || 'unknown';
  const sessionId = `${makeid(6)}_${phone.replace(/\D/g, '')}`;
  const sessionFolder = path.join(__dirname, 'sessions', sessionId);

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
    browser: ['GAMER XMD', 'Edge', '115.0'],
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, pairingCode } = update;

    if (pairingCode) {
      res.send(`<h3>📲 Code de parrainage :</h3><h1>${pairingCode}</h1><p>Entrez ce code dans WhatsApp pour connecter le bot.</p>`);
    }

    if (connection === 'open') {
      console.log(`✅ Session connectée pour ${phone}`);
    }

    if (connection === 'close') {
      console.log(`❌ Session fermée pour ${phone}`);
    }
  });
});

module.exports = router;