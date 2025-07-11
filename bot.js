const { default: makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const path = require('path');

async function startBot(sessionName = 'default') {
  const sessionFolder = path.join(__dirname, 'sessions', sessionName);
  const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, p => Buffer.from(p, 'binary')),
    },
    browser: ['GAMER XMD', 'Edge', '115.0']
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log(`✅ [${sessionName}] connecté`);
    }
    if (connection === 'close') {
      console.log(`❌ [${sessionName}] déconnecté`);
    }
  });

  return sock;
}

module.exports = { startBot };