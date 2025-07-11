const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, Browsers, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const { upload } = require('./mega');

let router = express.Router();

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    const id = makeid();
    const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
    let sent = false;

    try {
        let sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false,
            generateHighQualityLinkPreview: true,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            syncFullHistory: false,
            browser: Browsers.macOS('Safari')
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect, qr } = update;

            if (qr && !sent && !res.headersSent) {
                sent = true;
                res.json({ qr });
            }

            if (connection === 'open') {
                await delay(5000);
                const rf = __dirname + `/temp/${id}/creds.json`;

                try {
                    const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    let md = "GAMER~XMD~" + string_session;

                    await sock.sendMessage(sock.user.id, { text: md });

                    let desc = `🎮 Bot activé pour ${sock.user.id}`;
                    await sock.sendMessage(sock.user.id, {
                        text: desc,
                        contextInfo: {
                            externalAdReply: {
                                title: "DARK-GAMER",
                                thumbnailUrl: "https://files.catbox.moe/zzne7x.jpeg",
                                sourceUrl: "https://whatsapp.com/channel/0029VbAF9iTJUM2aPl9plJ2U",
                                mediaType: 1,
                                renderLargerThumbnail: true
                            }
                        }
                    });
                } catch (e) {
                    await sock.sendMessage(sock.user.id, { text: `Erreur : ${e.message}` });
                }

                await delay(500);
                await sock.ws.close();
                removeFile('./temp/' + id);
                process.exit();
            }

            if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== 401) {
                removeFile('./temp/' + id);
            }
        });

    } catch (err) {
        removeFile('./temp/' + id);
        if (!res.headersSent) {
            res.json({ code: "❗ Service Unavailable" });
        }
    }
});

module.exports = router;