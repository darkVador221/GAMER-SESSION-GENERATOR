# GAMER-SESSION-GENERATOR
# 🕹️ Dark Gamer Session Generator

![Dark Gamer](https://files.catbox.moe/zzne7x.jpeg)

Bienvenue dans le générateur de sessions WhatsApp du **Bot officiel Dark Gamer** ⚔️  
Ce site permet à tout utilisateur de se connecter **soit via QR Code**, **soit via un numéro de téléphone (code de parrainage)**.  
C’est rapide, sécurisé et entièrement automatisé.

---

## 🌐 Fonctionnalités

- 🔐 Génération de **sessions WhatsApp** via QR Code
- 📱 Connexion rapide **par numéro de téléphone**
- 🧠 Génération automatique de **code de parrainage (8 caractères aléatoires)**
- 🎨 Interface personnalisée avec image de fond unique
- 🚀 Prêt à déployer sur [Render](https://render.com) ou autre plateforme Node.js

---

## 🚀 Déploiement

### Prérequis

- Node.js v18+  
- Compte Render (ou autre hébergeur)  
- Dépôt GitHub connecté au bot WhatsApp (repo du bot ici : [Inco_dark](https://github.com/darkVador221/Inco_dark))

---

### Variables Render à configurer

Dans Render, va dans **Environment > Add Environment Variable**, ajoute :

```env
NODE_VERSION=18
⚠️ Important : cela évite les erreurs npm de version incompatibles.

⸻

Structure des fichiers
📦 GAMER-SESSION-GENERATOR
├── Dockerfile
├── server.js
├── qr.js
├── pair.js
├── package.json
├── /public
│   └── index.html

👑 Powered by

⚔️ Dark Gamer – Créateur de bots et conquérant des sessions
🌐 Suivez les mises à jour sur le repo principal du bot :
🔗 https://github.com/darkVador221/Inco_dark

---

### ✅ À faire :

- Place ce fichier à la racine de ton dépôt GitHub : `GAMER-SESSION-GENERATOR/README.md`
- Tu peux le modifier librement (ex : ajouter un lien vers ton WhatsApp)

Souhaites-tu aussi une **favicon personnalisée** ou un **bouton vers WhatsApp direct** ?