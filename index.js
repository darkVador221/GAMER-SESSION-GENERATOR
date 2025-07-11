const express = require('express');
const app = express();
console.log('🚀 GAMER XMD Server starting...');

__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8000;

let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

// Routes
app.use('/server', server);
app.use('/code', code);

// Nouvelle route pair.html (formulaire)
app.get('/pair-form', (req, res) => {
  res.sendFile(__path + '/pair.html');
});

app.use('/pair', code);
app.use('/qr', server);
app.use('/', (req, res) => {
  res.sendFile(__path + '/main.html');
});

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`🟢 GAMER XMD running on http://localhost:${PORT}`);
});

module.exports = app;