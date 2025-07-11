const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 8000;

let qr = require('./qr');
let pair = require('./pair');

app.use('/qr', qr);
app.use('/pair', pair);
app.use('/', (req, res) => res.sendFile(path.join(__dirname, 'main.html')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log("✅ GAMER XMD Session Manager running on port", PORT);
});