const express = require('express');
const { makeid } = require('./gen-id');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/', async (req, res) => {
  const code = makeid(6);
  const sessionFolder = path.join(__dirname, 'sessions', code);

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
    const { connection, lastDisconnect, pairingCode } = update;

    if (pairingCode) {
      res.send(`
        <html><body style="text-align:center;">
        <h2>📲 Pairing Code</h2>
        <h1>${pairingCode}</h1>
        <p>Entrez ce code dans WhatsApp pour connecter votre session.</p>
        </body></html>
      `);
    }

    if (connection === 'open') {
      console.log('✅ Session connected via pairing!');
      res.send(`<html><body><h2>Session Connected ✅</h2></body></html>`);
    }

    if (connection === 'close') {
      console.log('❌ Session closed.');
    }
  });
});

module.exports = router;