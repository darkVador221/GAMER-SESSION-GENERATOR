FROM node:18-alpine

WORKDIR /app

# Installer dépendances système pour puppeteer
RUN apk add --no-cache python3 make g++

# Copier package.json + package-lock.json (si existant)
COPY package.json ./

# Installer uniquement les dépendances de production
RUN npm install --omit=dev

# Copier le reste de l'application
COPY . .

# Définir port exposé
ENV PORT=3000
EXPOSE 3000

# Utilisateur non root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Démarrer l'app
CMD ["node", "index.js"]