FROM node:18-alpine

# Ajoute les paquets nécessaires (dont git)
RUN apk add --no-cache git python3 make g++

WORKDIR /app

# Copier package.json + package-lock.json si présent
COPY package.json ./

# Installer les dépendances (Git requis ici)
RUN npm install --omit=dev

# Copier le reste de l’application
COPY . .

# Définir le port d'écoute
ENV PORT=3000
EXPOSE 3000

# Créer un utilisateur non-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Commande de démarrage
CMD ["node", "index.js"]