const { makeid } = require('./gen-id');
const express = require('express');
const fs = require('fs');
const { startBot } = require('./bot');
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
    let num = req.query.number;

    if (!num || num.length < 6) {
        return res.status(400).json({ code: '❗ Numéro invalide' });
    }

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

        if (!sock.authState.creds.registered && !sent) {
            sent = true;
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await sock.requestPairingCode(num);
            if (!res.headersSent) {
                return res.json({ code });
            }
        }

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on("connection.update", async (s) => {
            const { connection } = s;

            if (connection == "open") {
                await delay(5000);
                await startBot(id);

                const rf = __dirname + `/temp/${id}/creds.json`;
                try {
                    const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                    const string_session = mega_url.replace('https://mega.nz/file/', '');
                    let md = "GAMER~XMD~" + string_session;

                    await sock.sendMessage(sock.user.id, { text: md });
                } catch (e) {
                    await sock.sendMessage(sock.user.id, { text: `Erreur : ${e.message}` });
                }

                await delay(500);
                await sock.ws.close();
                removeFile('./temp/' + id);
                process.exit();
            }
        });

    } catch (err) {
        removeFile('./temp/' + id);
        if (!res.headersSent) {
            res.json({ code: "❗ Erreur réseau" });
        }
    }
});

module.exports = router;