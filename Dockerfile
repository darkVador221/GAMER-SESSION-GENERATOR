# Utilise une image Node.js officielle
FROM node:18

# Crée un répertoire de travail
WORKDIR /app

# Copie les fichiers package.json et package-lock.json
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Copie tout le reste des fichiers
COPY . .

# Expose le port 8000 utilisé par le serveur
EXPOSE 8000

# Démarre l'application
CMD ["node", "index.js"]