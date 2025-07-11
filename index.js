const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

console.log('🚀 GAMER XMD Server starting...');

const __path = process.cwd();
const PORT = process.env.PORT || 8000;

require('events').EventEmitter.defaultMaxListeners = 500;

const qrRoutes = require('./qr');
const pairRoutes = require('./pair');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/qr', qrRoutes);
app.use('/pair', pairRoutes);

app.get('/pair-form', (req, res) => {
  res.sendFile(path.join(__path, 'pair.html'));
});

app.get('/qr-page', (req, res) => {
  res.sendFile(path.join(__path, 'qr.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__path, 'main.html'));
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🟢 GAMER XMD running on http://localhost:${PORT}`);
});
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;

module.exports = app;