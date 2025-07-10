const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function startBot(sessionId) {
  const { state, saveCreds } = await useMultiFileAuthState(`./temp/${sessionId}`);

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
    },
    printQRInTerminal: false,
    logger: pino({ level: "silent" }),
    browser: ["Gamer-XMD", "Chrome", "1.0.0"]
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on("connection.update", async ({ connection }) => {
    if (connection === "open") {
      console.log(`✅ Gamer-XMD Bot connecté avec ${sock.user.id}`);
    }
  });

  // Exemple : réponse automatique
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;
    await sock.sendMessage(msg.key.remoteJid, { text: "🤖 Hello, je suis Gamer-XMD Bot !" });
  });
}

module.exports = { startBot };