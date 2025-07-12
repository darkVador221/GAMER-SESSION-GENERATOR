const { makeid } = require('../gen-id');
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require('@whiskeysockets/baileys');

const { upload } = require('../core/mega');

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    let num = req.query.number;

    async function START_PAIRING() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            const sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "silent" }))
                },
                printQRInTerminal: false,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "silent" }),
                syncFullHistory: false,
                browser: Browsers.macOS('Safari')
            });

            if (!sock.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await sock.requestPairingCode(num);
                if (!res.headersSent) return res.send({ code });
            }

            sock.ev.on('creds.update', saveCreds);

            sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
                if (connection === "open") {
                    await delay(5000);

                    const sessionFile = `./temp/${id}/creds.json`;
                    const stream = fs.createReadStream(sessionFile);
                    const mega_url = await upload(stream, `${sock.user.id}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    const sessionCode = "GAMER~XMD~" + string_session;

                    await sock.sendMessage(sock.user.id, { text: sessionCode });

                    const description = `*🎮 GAMER-XMD Session Activated ✅*

╔═══✪〘 📡 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 〙✪══⊷❍
║📢 WhatsApp Channel :
║https://whatsapp.com/channel/0029VbAF9iTJUM2aPl9plJ2U
║💾 Fork Repo :
║https://github.com/darkVador221/Inco_dark
╚═══════════════════════⊷❍

⚠️ Never share your session ID!

🔋 Powered by GAMER-XMD`;

                    await sock.sendMessage(sock.user.id, {
                        text: description,
                        contextInfo: {
                            externalAdReply: {
                                title: "GAMER-XMD 🔥",
                                thumbnailUrl: "https://files.catbox.moe/zzne7x.jpeg",
                                sourceUrl: "https://whatsapp.com/channel/0029VbAF9iTJUM2aPl9plJ2U",
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });

                    await delay(1000);
                    await sock.ws.close();
                    removeFile('./temp/' + id);
                    console.log(`✅ ${sock.user.id} connected & session sent`);
                    process.exit();

                } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
                    await delay(1000);
                    START_PAIRING();
                }
            });

        } catch (err) {
            console.log("❌ Error in session creation:", err.message);
            removeFile('./temp/' + id);
            if (!res.headersSent) {
                return res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    await START_PAIRING();
});

module.exports = router;