import express from 'express';
const router = express.Router();

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post('/', async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.status(400).json({ success: false, error: 'Numéro manquant.' });
  }

  // ICI on simule un code pour la démonstration
  const generatedCode = generateCode();

  // Tu peux sauvegarder le numéro ou le code ici si tu veux

  res.json({ success: true, message: `Code généré avec succès : ${generatedCode}` });
});

export default router;