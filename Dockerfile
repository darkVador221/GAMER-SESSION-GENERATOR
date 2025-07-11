FROM node:18-alpine

WORKDIR /app

# Install Python and build tools
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm install --production

COPY . .

# Set environment variables
ENV PORT=3000
EXPOSE 3000

USER node

CMD ["node", "server/index.js"]