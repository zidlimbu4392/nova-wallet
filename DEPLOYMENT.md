# Deployment — Nova Wallet (Telegram Mini App)

## TL;DR

| Action | Command |
|---|---|
| Backend deps | `cd backend && npm install` |
| DB migrate | `cd backend && npx prisma migrate deploy` |
| Build frontend | static `index.html` + CSS (no build step) |
| Run (docker) | `docker-compose up -d --build` |
| Health | `curl http://localhost:3000/api/wallet` |

**Nova Wallet** = static frontend (`index.html`, vanilla JS) + Next.js backend
(`backend/`) + PostgreSQL (Prisma). nginx serves assets and proxies API/admin
to the backend.

---

## Required environment

| Var | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (Prisma) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (also HMAC secret for initData) |
| `PORT` | Backend HTTP port (default 3000) |
| `ADMIN_*` | admin credentials (verify in `backend/src` before prod) |

`.env` is gitignored.

---

## Architecture / request flow

```
Telegram Mini App (index.html, vanilla JS)
        │ fetch() /api/*  (same origin)
        ▼
nginx (:80)
   ├── /assets/*  → static files
   ├── /api/*     → Next.js (:3000)
   └── /admin/*   → admin dashboard
        ▼
Next.js backend (:3000)  —  initData auth + Zod + Prisma
        ▼
PostgreSQL (:5432)
```

---

## Building & running

```bash
# backend
cd backend
npm install
npx prisma generate
npx prisma migrate deploy        # apply schema to Postgres
npm run build                    # Next.js build
npm start                        # Next on :3000 (or node server.js)

# docker (whole stack)
docker-compose up -d --build
```

**Prices:** a cron job refreshes token prices from Binance every 5 minutes
(`GET /api/cron/prices`); the frontend auto-refreshes every 60 seconds.

---

## Database safety

- PostgreSQL via Prisma ORM; models: `User`, `Token`, `WalletBalance`,
  `Transaction`, `UserNFT`, `StakingPool`.
- Backups: `pg_dump` the database regularly (not automated in the repo).
- Prisma migrations live in `backend/prisma/`.

---

## Telegram Mini App hosting

The Web App must be served over public HTTPS (BotFather Mini App URL). Common
setup: nginx/Caddy TLS or a Cloudflare tunnel in front of nginx `:80`. The bot
uses initData auth; the app itself does not require a bot webhook.

---

## Server layout (reference)

```
nova-wallet/
├── index.html / screens.css / components.css   ← static frontend
├── Dockerfile / docker-compose.yml
├── backend/                                    ← Next.js + Prisma
│   ├── prisma/schema.prisma
│   └── src/{app,lib}
└── nova-wallet-vNN-*.tar.gz                    ← legacy version backups
```

---

## What does NOT deploy automatically

- `.env` (DATABASE_URL, bot token) — host-side.
- PostgreSQL data — persistent, provisioned once.
- The Telegram Mini App URL — BotFather-side.
- The cron price job needs the backend running continuously (no external
  scheduler configured).

---

## Monitoring & operations

- Logging to stdout/stderr (docker logs).
- No structured logging / metrics / alerting — see `SECURITY_AUDIT.md`.
