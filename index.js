const express = require('express');
const bodyParser = require("body-parser");
const path = require('path');
const app = express();

__path = process.cwd();
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

app.listen(PORT, () => {
  console.log(`🟢 GAMER XMD running on port ${PORT}`);
});

module.exports = app;
