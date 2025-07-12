FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++ git

COPY package.json ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "index.js"]