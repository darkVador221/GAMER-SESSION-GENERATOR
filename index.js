const express = require('express');
const app = express();
const path = require('path');
const pairRouter = require('./server/pair');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes API
app.use('/pair', pairRouter);

// Fallback root route
app.get('/', (req, res) => {
    res.send('🔥 GAMER-XMD API is running. Use /pair?number=+221xxxxxx to generate your code.');
});

// Static if needed
app.use('/public', express.static(path.join(__dirname, 'public')));

// Port setting
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 GAMER-XMD is live on port ${PORT}`);
});