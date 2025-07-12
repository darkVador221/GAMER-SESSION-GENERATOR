// index.js – GAMER-XMD Entrypoint 🚀

console.log('🟢 Starting GAMER-XMD...');

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const pairRoute = require('./pair'); // Fichier de connexion via code de parrainage
const sessionManager = require('./sessionManager'); // Fichier de gestion de session (nécessaire au déploiement stable)

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serveur de fichiers statiques (si tu veux y ajouter un frontend plus tard)
app.use(express.static(path.join(__dirname, 'public')));

// Routes principales
app.use('/pair', pairRoute); // Route de génération du code pairing

// Page d’accueil simple
app.get('/', (req, res) => {
    res.send(`<h2>🚀 GAMER-XMD BACKEND IS RUNNING!</h2>
    <p>🔗 Pour générer un pairing code, ajoute ?number=+votrenuméro à /pair</p>`);
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ GAMER-XMD ready on port ${PORT}`);
});