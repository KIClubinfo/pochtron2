FROM node:10

RUN mkdir /app
WORKDIR /app
COPY . .

RUN npm install --unsafe-perm
CMD ["npm", "start"]
