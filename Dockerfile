FROM node:20-alpine

WORKDIR /app

# Copy root and server dependencies
COPY package*.json ./
RUN npm install

COPY server/package*.json ./server/
RUN cd server && npm install

# Copy application source
COPY . .

# Build frontend production bundle
RUN npm run build

# Expose port
EXPOSE 5050

ENV PORT=5050
ENV NODE_ENV=production

# Start unified server
CMD ["node", "server/server.js"]
