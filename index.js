const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode');
const sessionManager = require('./core/sessionManager');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.get('/qr', (req, res) => res.sendFile(__dirname + '/public/qr.html'));
app.get('/pair', (req, res) => res.sendFile(__dirname + '/public/pair.html'));

app.get('/api/qr', async (req, res) => {
  const { state, saveCreds } = await useMultiFileAuthState('sessions/qr');
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state });
  sock.ev.on('connection.update', update => {
    if (update.qr) qrcode.toDataURL(update.qr).then(qr => res.json({ qr }));
    if (update.connection === 'open') saveCreds();
    if (update.connection === 'close') sock.end();
  });
});

app.post('/api/pair', async (req, res) => {
  const phone = req.body.phone;
  const { state, saveCreds } = await useMultiFileAuthState(`sessions/${phone}`);
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({ version, auth: state });
  sock.ev.on('connection.update', async update => {
    if (update.connection === 'open') {
      await saveCreds();
      const sid = await sessionManager.saveSession(state);
      res.json({ sessionId: sid });
    }
  });
});

sessionManager.connect().then(() => {
  app.listen(process.env.PORT || 3000, () => console.log("🏁 Serveur démarré"));
});