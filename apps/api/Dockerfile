FROM node:20

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/apps/api

EXPOSE 5000

CMD ["npm", "run", "dev"]