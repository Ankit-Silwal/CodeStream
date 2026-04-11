FROM node:20

WORKDIR /app

COPY . .

RUN npm install

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["npm", "run", "dev"]