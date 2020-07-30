FROM node:12.18.3-alpine3.12

WORKDIR /app

COPY package*.json ./
RUN npm install --silent
COPY . /app

EXPOSE 3000

#CMD ["./node_modules/nodemon/bin/nodemon.js", "server.js"]
CMD ["node", "server.js"]