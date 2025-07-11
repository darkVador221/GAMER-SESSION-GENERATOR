const { makeid } = require('./gen-id');
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

const { upload } = require('./mega');

// Fonction pour supprimer un fichier
function removeFile(FilePath) {
  if (fs.existsSync(FilePath)) {
    fs.rmSync(FilePath, { recursive: true, force: true });
  }
}

router.get('/', async (req, res) => {
  const id = makeid();
  let num = req.query.number;

  async function generatePairCode() {
    const { state, saveCreds } = await useMultiFileAuthState(`./temp/${id}`);
    try {
      const randomBrowser = ["Safari"];
      const browserChoice = randomBrowser[Math.floor(Math.random() * randomBrowser.length)];

      const sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }))
        },
        printQRInTerminal: false,
        generateHighQualityLinkPreview: true,
        logger: pino({ level: "fatal" }),
        syncFullHistory: false,
        browser: Browsers.macOS(browserChoice)
      });

      if (!sock.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await sock.requestPairingCode(num);
        if (!res.headersSent) {
          return res.send({ code });
        }
      }

      sock.ev.on('creds.update', saveCreds);

      sock.ev.on("connection.update", async ({ connection, lastDisconnect }) => {
        if (connection === "open") {
          await delay(5000);

          const credsPath = `./temp/${id}/creds.json`;
          const sessionData = fs.readFileSync(credsPath);
          const sessionStream = fs.createReadStream(credsPath);

          const megaURL = await upload(sessionStream, `${sock.user.id}.json`);
          const sessionCode = "GAMER~XMD~" + megaURL.replace('https://mega.nz/file/', '');

          const message = await sock.sendMessage(sock.user.id, { text: sessionCode });

          const welcomeText = `*▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
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
            text: welcomeText,
            contextInfo: {
              externalAdReply: {
                title: "DARK-GAMER",
                thumbnailUrl: "https://files.catbox.moe/zzne7x.jpeg",
                sourceUrl: "https://whatsapp.com/channel/0029VbAF9iTJUM2aPl9plJ2U",
                mediaType: 1,
                renderLargerThumbnail: true
              }
            }
          }, { quoted: message });

          await delay(1000);
          await sock.ws.close();
          removeFile(`./temp/${id}`);
          console.log(`✅ Session ${sock.user.id} enregistrée et supprimée du dossier temp.`);
          process.exit();

        } else if (connection === "close" && lastDisconnect?.error?.output?.statusCode !== 401) {
          await delay(3000);
          generatePairCode(); // Retry
        }
      });

    } catch (err) {
      console.error("❌ Erreur dans la génération du code :", err);
      removeFile(`./temp/${id}`);
      if (!res.headersSent) {
        res.send({ code: "❗ Service Unavailable" });
      }
    }
  }

  return await generatePairCode();
});

module.exports = router;