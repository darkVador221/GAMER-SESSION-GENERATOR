import express from 'express';

const router = express.Router();

// En mémoire, stocke les paires { phone: code }
const pairs = new Map();

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for(let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

router.post('/', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Numéro de téléphone manquant' });
  }

  // Ici tu peux ajouter une validation simple du numéro (ex: regex)

  let code;
  if (pairs.has(phone)) {
    code = pairs.get(phone);
  } else {
    code = generateCode();
    pairs.set(phone, code);
  }

  res.json({ success: true, code });
});

export default router;