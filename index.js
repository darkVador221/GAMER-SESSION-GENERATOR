const express = require('express');
const app = express();
__path = process.cwd();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 5000;

let server = require('./qr'),
    code = require('./pair');

require('events').EventEmitter.defaultMaxListeners = 500;

app.use('/server', server);
app.use('/code', code);
app.use('/pair', (req, res) => {
  res.sendFile(__path + '/pair.html');
});
app.use('/qr', (req, res) => {
  res.sendFile(__path + '/qr.html');
});
app.use('/', (req, res) => {
  res.sendFile(__path + '/main.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});