FROM node:20-bookworm-slim

# Remotion's Chrome Headless Shell dependencies
RUN apt-get update && apt-get install -y \
    libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 \
    libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 \
    libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 \
    libcups2 ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

# Pre-download the browser Remotion uses for rendering
RUN npx remotion browser ensure

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
