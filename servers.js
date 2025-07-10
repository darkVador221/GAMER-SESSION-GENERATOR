import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import QRCode from "qrcode";
import simpleGit from "simple-git";
import bodyParser from "body-parser";
import config from "./config.js";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors({ origin: config.ALLOWED_ORIGINS }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

const PORT = config.PORT;

const sessions = new Map(); // sessionId -> ws connection
const referralCodes = config.REFERRAL_CODES;

// Cloner le bot depuis GitHub à chaque démarrage (simple clone/pull)
const git = simpleGit();

const botDir = path.resolve(__dirname, "bot");
async function cloneOrUpdateBot() {
  if (!fs.existsSync(botDir)) {
    console.log("Clonage du bot...");
    await git.clone(config.BOT_REPO_URL, botDir);
  } else {
    console.log("Mise à jour du bot...");
    await git.cwd(botDir);
    await git.pull();
  }
}
cloneOrUpdateBot().catch(console.error);

// Route accueil - page QR
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/qr.html"));
});

// Route pour la connexion par code de parrainage
app.get("/pair", (req, res) => {
  res.sendFile(path.join(__dirname, "public/pages/pair.html"));
});

// API pour générer QR (mocké ici)
app.get("/api/generate-qr", (req, res) => {
  // Simuler un QR code de connexion (en vrai, c'est dynamique par ws)
  const dummyQrText = "QRCodeForSession123456";
  QRCode.toDataURL(dummyQrText)
    .then(url => {
      res.json({ qr: url });
    })
    .catch(err => {
      res.status(500).json({ error: "Erreur génération QR" });
    });
});

// API pour créer une session via code de parrainage
app.post("/api/connect-referral", (req, res) => {
  const { referralCode } = req.body;
  if (!referralCode) return res.status(400).json({ error: "Code parrainage manquant" });
  if (!referralCodes[referralCode]) {
    return res.status(404).json({ error: "Code parrainage invalide" });
  }

  // Ici, on associe le code au client (mock)
  res.json({ message: "Connexion par code réussie", sessionId: referralCode });
});

// WebSocket serveur pour communication temps réel (ex: session QR)
const wss = new WebSocketServer({ noServer: true });

wss.on("connection", ws => {
  console.log("Client WS connecté");

  ws.on("message", message => {
    console.log("Message WS reçu:", message.toString());
    // Gérer ici la communication entre client et serveur (ex: envoyer QR, recevoir session)
  });

  ws.on("close", () => {
    console.log("Client WS déconnecté");
  });
});

// Serveur HTTP et upgrade WS
const server = app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

server.on("upgrade", (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, ws => {
    wss.emit("connection", ws, request);
  });
});