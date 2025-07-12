const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getSessions, deleteSession } = require('../lib/sessionStore');

router.get('/api/sessions', async (req, res) => {
    const sessions = await getSessions();
    res.json(sessions);
});

router.delete('/api/sessions/:phone', async (req, res) => {
    const phone = req.params.phone;
    try {
        await deleteSession(phone);

        const sessionPath = path.join(__dirname, `../sessions/${phone}`);
        if (fs.existsSync(sessionPath)) {
            fs.rmSync(sessionPath, { recursive: true, force: true });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Erreur suppression session' });
    }
});

module.exports = router;
