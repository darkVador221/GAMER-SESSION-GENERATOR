FROM node:18-alpine

WORKDIR /app

# Dépendances système
RUN apk add --no-cache curl python3 make g++

# Récupérer les images (assets)
RUN mkdir -p public/assets && \
    curl -o public/assets/bg-home.jpg https://files.catbox.moe/zzne7x.jpeg && \
    curl -o public/assets/bg-pair.jpg https://files.catbox.moe/74spgs.jpeg && \
    curl -o public/assets/bg-qr.jpg https://files.catbox.moe/vewh4c.jpeg

# Copie et installation des dépendances
COPY package*.json ./
RUN npm install --production

# Copie du code
COPY . .

# Config
ENV PORT=3000
EXPOSE 3000

# Sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

CMD ["node", "server/index.js"]