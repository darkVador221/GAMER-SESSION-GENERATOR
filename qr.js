import express from 'express';
const router = express.Router();

// FAUSSE URL QR CODE TEMPORAIRE POUR TEST
router.get('/', async (req, res) => {
  const fakeQR = 'https://api.qrserver.com/v1/create-qr-code/?data=DarkGamerBotSession';
  res.json({ qr: fakeQR });
});

export default router;