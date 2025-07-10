import express from 'express';
import QRCode from 'qrcode';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    // Simule génération QR code (en base64 image)
    // Ici, normalement, tu récupères la session Baileys et génères le QR
    const sampleText = 'Dummy session QR code for Dark Gamer';
    const qrImage = await QRCode.toDataURL(sampleText);

    res.json({ qr: qrImage });
  } catch (error) {
    res.status(500).json({ error: 'Erreur génération QR' });
  }
});

export default router;