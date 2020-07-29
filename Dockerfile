FROM node:12.18.3-alpine3.12

WORKDIR /app

COPY package*.json ./
RUN npm install --silent
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]