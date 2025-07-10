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

    async function GIFTED_MD_QR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);
        try {
            var items = ["Safari"];
            function selectRandomItem(array) {
                var randomIndex = Math.floor(Math.random() * array.length);
                return array[randomIndex];
            }
            var randomItem = selectRandomItem(items);

            let sock = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: true,
                generateHighQualityLinkPreview: true,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                syncFullHistory: false,
                browser: Browsers.macOS(randomItem)
            });

            sock.ev.on('connection.update', async (update) => {
                const { connection, lastDisconnect, qr } = update;

                if (qr && !res.headersSent) {
                    res.write(JSON.stringify({ qr }));
                }

                if (connection === "open") {
                    await delay(5000);
                    let rf = __dirname + `/temp/${id}/creds.json`;

                    try {
                        const mega_url = await upload(fs.createReadStream(rf), `${sock.user.id}.json`);
                        const string_session = mega_url.replace('https://mega.nz/file/', '');
                        let md = "GAMER~XMD~" + string_session;

                        await sock.sendMessage(sock.user.id, { text: md });

                        let desc = `*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
╔═══✪〘 🎮 𝗕𝗢𝗧 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 〙✪══⊷❍
║👾 𝗚𝗥𝗘𝗘𝗧𝗜𝗡𝗚𝗦 : ${m.pushName}
║🔐 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗔𝗟𝗘𝗥𝗧 : 𝗡𝗲𝘃𝗲𝗿 𝘀𝗵𝗮𝗿𝗲 𝘆𝗼𝘂𝗿 𝘀𝗲𝘀𝘀𝗶𝗼𝗻 𝗜𝗗!
║💻 𝗕𝗢𝗧 : 𝗚𝗔𝗠𝗘𝗥-𝗫𝗠𝗗
╚══════════════════⊷❍
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰

╔═══✪〘 📡 𝗖𝗢𝗡𝗡𝗘𝗖𝗧 〙✪══⊷❍
║📢 𝗪𝗵𝗮𝘁𝘀𝗔𝗽𝗽 𝗖𝗵𝗮𝗻𝗻𝗲𝗹 : 
║https://whatsapp.com/channel/0029VbAF9iTJUM2aPl9plJ2U
║💾 𝗙𝗼𝗿𝗸 𝗥𝗲𝗽𝗼𝘀𝗶𝘁𝗼𝗿𝘆 :
║https://github.com/darkVador221/Inco_dark
╚══════════════════⊷❍
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
𝗣𝗢𝗪𝗘𝗥𝗘𝗗 𝗕𝗬 𝗚𝗔𝗠𝗘𝗥-𝗫𝗠𝗗 | 𝗩𝟭.𝟬*`; 

                        await sock.sendMessage(sock.user.id, {
                            text: desc,
                            contextInfo: {
                                externalAdReply: {
                                    title: "DARK-GAMER",
                                    thumbnailUrl: "https://files.catbox.moe/zzne7x.jpeg",
                                    sourceUrl: "https://whatsapp.com/channel/0029VbAxzfJFcow0o5qexb0O",
                                    mediaType: 1,
                                    renderLargerThumbnail: true
                                }
                            }
                        });
                    } catch (e) {
                        await sock.sendMessage(sock.user.id, { text: `Error: ${e.message || e}` });
                    }

                    await delay(10);
                    await sock.ws.close();
                    await removeFile('./temp/' + id);
                    console.log(`👤 ${sock.user.id} Connected ✅ Restarting process...`);
                    await delay(10);
                    process.exit();
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10);
                    GIFTED_MD_QR_CODE();
                }
            });

        } catch (err) {
            console.log("Service restarted");
            await removeFile('./temp/' + id);
            if (!res.headersSent) {
                await res.send({ code: "❗ Service Unavailable" });
            }
        }
    }

    return await GIFTED_MD_QR_CODE();
});

module.exports = router;
