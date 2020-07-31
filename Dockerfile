FROM node:12.18.3-alpine3.12

WORKDIR /app

COPY package*.json ./
RUN npm install --silent
RUN npm install nodemon -g --silent
COPY . /app

EXPOSE 3000

CMD ["nodemon", "server.js"]