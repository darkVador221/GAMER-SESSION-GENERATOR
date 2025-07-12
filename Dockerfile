# Image Node officielle
FROM node:18-alpine

# Dossier de travail
WORKDIR /app

# Copie des fichiers
COPY . .

# Installation des dépendances
RUN npm install

# Port exposé
EXPOSE 3000

# Lancement de l'app
CMD ["npm", "start"]