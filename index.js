const express = require('express');
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

require('events').EventEmitter.defaultMaxListeners = 500;

// Routes
const qrRoute = require('./qr');
const pairRoute = require('./pair');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/server', qrRoute); // legacy
app.use('/code', pairRoute);

// HTML pages
app.get('/pair', (req, res) => res.sendFile(path.join(__dirname, 'pair.html')));
app.get('/qr', (req, res) => res.sendFile(path.join(__dirname, 'qr.html')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'main.html')));

app.listen(PORT, () => {
  console.log(`✅ GAMER-XMD running on http://localhost:${PORT}`);
});

module.exports = app;