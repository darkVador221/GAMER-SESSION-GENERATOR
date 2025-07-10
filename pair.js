import express from 'express';

const router = express.Router();

// Simule stockage en mémoire (à remplacer par ta DB)
const sessions = new Map();

router.post('/', (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Code manquant' });
  }

  // Ici, tu vérifies que le code existe et crée une session liée
  // Pour test, on valide un code fixe "DARK123"
  if (code === 'DARK123') {
    // Simuler la création / association de session
    sessions.set(code, { connected: true, createdAt: new Date() });
    return res.json({ success: true, message: 'Session connectée via code parrainage !' });
  } else {
    return res.status(404).json({ success: false, error: 'Code invalide' });
  }
});

export default router;