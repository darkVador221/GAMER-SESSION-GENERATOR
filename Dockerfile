FROM node:18-alpine

WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache curl python3 make g++

# Télécharger les images d'arrière-plan
RUN mkdir -p public/assets && \
    curl -o public/assets/bg-home.jpg https://files.catbox.moe/zzne7x.jpeg && \
    curl -o public/assets/bg-pair.jpg https://files.catbox.moe/74spgs.jpeg && \
    curl -o public/assets/bg-qr.jpg https://files.catbox.moe/vewh4c.jpeg

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install --production

# Copier l'application
COPY . .

# Variables d'environnement
ENV PORT=3000
EXPOSE 3000

# Sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server/index.js"]