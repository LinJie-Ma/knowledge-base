# Stage 1: Build Vue frontend
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# Stage 2: Production runtime (server runs with tsx)
FROM node:20-alpine
WORKDIR /app

# Install nginx
RUN apk add --no-cache nginx

# Copy server source + deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --omit=dev && npm install tsx
COPY server/ ./

# Copy client build
COPY --from=client-build /app/client/dist /app/client/dist

# Copy nginx config
WORKDIR /app
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

# Copy entrypoint
COPY docker/entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/data

EXPOSE 80
CMD ["./entrypoint.sh"]
