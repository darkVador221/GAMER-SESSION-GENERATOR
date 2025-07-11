FROM node:18-alpine

WORKDIR /app

# Installer dépendances système (qrcode, puppeteer, etc.)
RUN apk add --no-cache curl python3 make g++ chromium

# Préparer les images de fond
RUN mkdir -p public/assets && \
    curl -o public/assets/bg-home.jpg https://files.catbox.moe/zzne7x.jpeg && \
    curl -o public/assets/bg-pair.jpg https://files.catbox.moe/74spgs.jpeg && \
    curl -o public/assets/bg-qr.jpg https://files.catbox.moe/vewh4c.jpeg

# Installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le code de l'app
COPY . .

# Variables d’environnement
ENV PORT=3000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
EXPOSE 3000

# Utilisateur non-root (sécurité)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Lancer l’app
CMD ["node", "server/index.js"]