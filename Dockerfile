FROM node:12.18.3-alpine3.12

WORKDIR .

COPY package*.json ./
RUN npm install --silent
#RUN npm install nodemon -g --silent
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]