const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  try {
    const sessionPath = './sessions/gamer-xmd.json';

    // Crée le dossier si besoin
    if (!fs.existsSync('./sessions')) fs.mkdirSync('./sessions');

    const { state, saveState } = useSingleFileAuthState(sessionPath);
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('connection.update', (update) => {
      const { connection, qr } = update;

      if (qr) {
        res.json({ qr });
      }

      if (connection === 'open') {
        console.log('✅ Bot connecté via QR.');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code.' });
  }
};