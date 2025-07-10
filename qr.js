import express from 'express';
import QRCode from 'qrcode';

const router = express.Router();

// Exemple simple : on génère un QR code à partir d'une chaîne statique ou dynamique
router.get('/', async (req, res) => {
  try {
    // Tu peux remplacer cette valeur par un contenu dynamique (ex: session ID)
    const qrData = 'https://darkgamer-session-connect.example.com/session/12345';

    const qrImage = await QRCode.toDataURL(qrData);

    res.json({ qr: qrImage, data: qrData });
  } catch (error) {
    console.error('Erreur génération QR:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du QR code' });
  }
});

export default router;