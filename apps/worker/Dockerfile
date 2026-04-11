FROM node:20
WORKDIR /app
COPY . .
RUN npm install
WORKDIR /app/apps/worker
CMD ["npm", "run", "dev"]