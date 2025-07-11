const { makeid } = require('./gen-id');

// Exemple : reçoit une requête avec ?phone=221778271315
module.exports = async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone || !/^\d{9,15}$/.test(phone)) {
      return res.status(400).json({ error: 'Numéro invalide. Exemple : 221778271315' });
    }

    const code = makeid(8);
    console.log(`📦 Nouveau code généré pour ${phone} : ${code}`);
    res.json({ code });
  } catch (e) {
    console.error('Erreur génération de pair code:', e);
    res.status(500).json({ error: 'Erreur serveur interne.' });
  }
};