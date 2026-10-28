FROM node:20-alpine
LABEL maintainer="Yashvardhan Tiwari <shreekrishantiwari@gmail.com>"
LABEL project="Shivakriti Constructions Backend API & Metrics Exporter"

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install production dependencies (including prom-client)
RUN npm install --omit=dev

# Copy server code
COPY . .

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:5000/health || exit 1

CMD ["node", "server.js"]
