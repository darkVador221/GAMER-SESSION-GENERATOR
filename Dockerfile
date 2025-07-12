FROM node:18-alpine

# Dossier de travail
WORKDIR /app

# Installer dépendances système nécessaires à Puppeteer
RUN apk add --no-cache curl python3 make g++ \
    && apk add --no-cache chromium

# Variables d’environnement pour Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copier les fichiers de dépendance
COPY package*.json ./

# Installer les dépendances node
RUN npm install --omit=dev

# Copier tout le projet
COPY . .

# Télécharger les images
RUN mkdir -p public/assets && \
    curl -o public/assets/bg-home.jpg https://files.catbox.moe/zzne7x.jpeg && \
    curl -o public/assets/bg-pair.jpg https://files.catbox.moe/74spgs.jpeg && \
    curl -o public/assets/bg-qr.jpg https://files.catbox.moe/vewh4c.jpeg

# Définir le port
ENV PORT=3000
EXPOSE 3000

# Utilisateur non root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Commande de démarrage
CMD ["node", "server/index.js"]