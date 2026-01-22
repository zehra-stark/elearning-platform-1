FROM node:18

WORKDIR /app

# Copy dependencies first for cache use
COPY elms-app/package*.json ./

RUN npm install

# Copy full app
COPY elms-app/ ./

EXPOSE 3000

CMD ["node", "app.js"]

