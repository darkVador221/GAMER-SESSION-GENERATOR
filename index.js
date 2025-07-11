const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const path = require('path');
const PORT = process.env.PORT || 8000;

// Fichiers internes
const qrHandler = require('./qr');
const pairHandler = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes API
app.get('/qr', qrHandler);
app.get('/pair', pairHandler);

// Routes UI
app.get('/qr-ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'qr.html'));
});
app.get('/pair-ui', (req, res) => {
  res.sendFile(path.join(__dirname, 'pair.html'));
});
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'main.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Gamer-XMD server running on http://localhost:${PORT}`);
});