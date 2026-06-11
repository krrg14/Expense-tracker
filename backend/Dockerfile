FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json /

RUN npm install 

FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app ./

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
