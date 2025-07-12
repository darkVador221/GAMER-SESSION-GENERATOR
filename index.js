const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const pair = require("./pair");

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use("/pair", pair);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("✅ GAMER-XMD ready on port " + PORT));