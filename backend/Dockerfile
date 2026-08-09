FROM node:20-slim

# Install OpenSSL + curl + cron (required by Prisma + price updates)
RUN apt-get update -y && apt-get install -y openssl curl cron && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma client (doesn't need DB connection)
RUN npx prisma generate

# Cron job: update prices every 5 minutes
RUN echo "*/5 * * * * curl -s -H 'Authorization: Bearer dev-cron-secret' http://localhost:3000/api/cron/prices >> /var/log/cron.log 2>&1" > /etc/cron.d/price-update && \
    chmod 0644 /etc/cron.d/price-update && \
    crontab /etc/cron.d/price-update

EXPOSE 3000

# Push schema to DB, start cron daemon, then start Next.js
CMD ["sh", "-c", "npx prisma db push && cron && npm run dev"]
