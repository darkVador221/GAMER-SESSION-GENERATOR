import express from 'express';

const router = express.Router();

// Stockage temporaire en mémoire des codes valides -> sessions associées
const validCodes = new Map([
  ['ABC123', 'session1'],
  ['XYZ789', 'session2']
]);

router.post('/', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code manquant' });
  }

  if (!validCodes.has(code)) {
    return res.status(404).json({ error: 'Code invalide' });
  }

  const sessionId = validCodes.get(code);
  // TODO: Ici, ajoute ta logique de connexion à la session liée au code

  return res.json({ success: true, message: `Session ${sessionId} connectée avec le code ${code}` });
});

export default router;