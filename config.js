// Configuration globale
export default {
  BOT_REPO_URL: process.env.BOT_REPO_URL || "https://github.com/darkVador221/Inco_dark",
  SESSION_PATH: "./sessions",
  PORT: process.env.PORT || 3000,
  ALLOWED_ORIGINS: ["*"], // Tu peux restreindre plus tard
  REFERRAL_CODES: {}, // En mémoire, pour stocker codes parrainage (à améliorer avec base de données)
};