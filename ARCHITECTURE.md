# Nova Wallet — Architecture (standalone spec)

> Standalone specification for the **Nova Wallet** Telegram Mini App. The source
> code in this repository is the source of truth. Everything below describes
> what **actually exists** (read from the code), not a plan.

---

## 1. Project Overview

**Nova Wallet** is a full-stack crypto **portfolio wallet** built as a Telegram
Mini App: real-time token prices (from Binance), dashboard with animated
balance + sparkline, send / receive / swap / stake flows, an NFT gallery with
procedurally generated SVG art, and an admin dashboard.

Frontend is a **single static HTML page** (vanilla JS) served by nginx; backend
is a **Next.js app** with **Prisma + PostgreSQL**. Telegram `initData`
HMAC-SHA256 auth gates every request.

> Note: like the rest of the demo, send/swap/stake and balances are **simulated**
> — there is no real payment or on-chain settlement (see §9).

### High-level flow

```
Telegram Mini App (HTML + CSS + vanilla JS, index.html)
        │  fetch() /api/*
        ▼
Nginx reverse proxy (:80)
        ├── /assets/*  → static files
        ├── /api/*     → Next.js backend
        └── /admin/*   → admin panel
        ▼
Next.js backend (:3000)  —  Telegram auth (HMAC) + Zod + Prisma
        ▼
PostgreSQL (:5432)
```

### Tech stack (exact)

| Concern | Choice |
|---|---|
| Frontend | Single `index.html` + vanilla JS + 3 CSS files |
| Charts | lightweight-charts 4.1.3 (standalone) |
| Icons/anim | lordicon (CDN), CSS blobs/grain |
| Backend | Next.js (App Router) |
| ORM | Prisma |
| DB | PostgreSQL |
| Validation | Zod (send/swap/stake schemas) |
| Auth | Telegram initData HMAC-SHA256 |
| Prices | Binance API, cron every 5 min, frontend refresh 60 s |

---

## 2. Repository structure

```
nova-wallet/
├── index.html              ← the whole SPA (dashboard, send/swap/stake, NFT, admin)
├── screens.css             ← screen styles (cache-busted ?v=)
├── components.css          ← component styles
├── Dockerfile / docker-compose.yml
├── README.md / CLAUDE.md / AGENTS.md
├── backend/                ← Next.js backend (separate build)
│   ├── package.json / tsconfig.json / next.config.ts / eslint.config.mjs
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma   ← User, Token, WalletBalance, Transaction, UserNFT, StakingPool
│   │   └── ...
│   └── src/
│       ├── lib/
│       │   ├── prisma.ts           ← Prisma client singleton
│       │   ├── auth.ts             ← auth helpers
│       │   ├── telegram-auth.ts    ← initData HMAC validation
│       │   └── schemas.ts          ← Zod schemas for POST endpoints
│       └── app/
│           ├── layout.tsx / globals.css
│           └── page.tsx            ← Next root (renders admin/API layer)
├── public/ (inside backend)  ← Next static assets
└── nova-wallet-vNN-*.tar.gz  ← legacy version backups (v1…v93), keep for history
```

---

## 3. Frontend (`index.html`)

- **Shell**: `meta viewport` for Telegram, `theme-color #F2F2F7`, hard
  no-cache headers, unregister old **service workers** on load.
- **Libraries**: `telegram-web-app.js`, `lordicon.js`, `lightweight-charts`.
- **Animated background**: 4 blurred `blob` elements + grain overlay (iOS
  wallpaper style).
- **Desktop frame**: a `.device` phone frame with notch when viewed on desktop.
- **Global loader** covering the screen until data is ready.
- **Screens** (single page, tab-driven):
  - Dashboard — 9 crypto tokens, live prices from Binance, animated balance
    counter, 24h portfolio change, interactive sparkline, quick actions
    Send / Receive / Swap.
  - Token details — per-token sparkline, filtered transaction history,
    Buy/Sell (routes to Swap).
  - Send — validates address, checks balance, POST `/api/send`.
  - Swap — live rate + slippage, POST `/api/swap`.
  - Stake — 5 staking pools with APY, POST `/api/stake`.
  - NFT gallery — 6 NFTs, procedural SVG art, floor price, sell/share.
  - Activity — transaction history.
- **Styling**: `base.css` + `components.css` + `screens.css`, iOS-like light
  theme (`#F2F2F7`), cache-busted with `?v=` query versions.

---

## 4. Backend (Next.js `backend/`)

| Endpoint | Purpose |
|---|---|
| `GET /api/wallet` | dashboard data (balances, prices, portfolio) |
| `GET /api/token/:id` | token details + history |
| `POST /api/send` | transfer tokens (Zod-validated) |
| `POST /api/swap` | swap tokens (live rate + slippage) |
| `POST /api/stake` | stake into a pool |
| `GET /api/cron/prices` | refresh prices from Binance (cron) |
| `GET /admin` | admin dashboard (tokens, users, transactions, staking pools) |

**Middleware chain** per request: Telegram `initData` HMAC-SHA256 validation →
Zod schema validation on POST bodies → Prisma ORM persistence.

Auto user registration on the first Telegram visit.

---

## 5. Database (PostgreSQL via Prisma)

Prisma models (`prisma/schema.prisma`):

| Model | Purpose |
|---|---|
| `User` | telegramId, walletAddress |
| `Token` | id, prices, icons, 24h change |
| `WalletBalance` | userId ↔ tokenId, amount |
| `Transaction` | send/swap/stake history |
| `UserNFT` | owned NFTs, floor price |
| `StakingPool` | pools, APY, lock period |

**Live prices**: a cron job updates prices every 5 minutes from Binance; the
frontend auto-refreshes every 60 seconds.

---

## 6. Auth & security

- **Telegram `initData` HMAC-SHA256** validation (`telegram-auth.ts`) — same
  scheme as all Telegram Mini Apps.
- **Zod schema validation** on all POST endpoints (send/swap/stake).
- Auto-registration of new users.

---

## 7. Deployment

- `docker-compose.yml` runs the frontend nginx container + Next.js backend +
  PostgreSQL.
- nginx serves `/assets/*` statically and reverse-proxies `/api/*` and
  `/admin/*` to Next on `:3000`.
- The repo also carries the cloudflared binary (`cloudflared-linux-amd64.deb`)
  used for a quick public tunnel — **should be removed from version control**
  (see §9).

---

## 8. Legacy artifacts

- `nova-wallet-vNN-*.tar.gz` — dozens of incremental version backups
  (v1 … v93). These are **history, not the live source**. The current code is
  `index.html` + `backend/`. Keeping them bloats the repo (~dozens of MB);
  consider moving them to a release archive.

---

## 9. What is NOT done yet / gaps (honest audit)

> **Security audit: NOT done.** This repository has never had a security
> review. Do not run it with real funds/user data until the items below are
> addressed.

1. **Security audit** — never performed (auth, Prisma access control, admin
   exposure, secrets handling, Telegram auth edge cases).
2. **No tests** — zero coverage of backend routes, Prisma logic, or the
   frontend.
3. **Simulated money** — send/swap/stake and balances are simulated; there is
   **no real payment gateway, on-chain settlement, KYC or custody**.
4. **Admin dashboard** — `GET /admin` has no documented password/ACL in the
   repo; verify it is not reachable publicly.
5. **Cron price job** — no auth/rate-limit documented for `/api/cron/prices`;
   if publicly reachable it allows abuse and reveals Binance dependency.
6. **Secrets** — `.env` (Telegram bot token, DB creds) is gitignored, but there
   is no CI-secrets story, no rotation, no least-privilege DB user.
7. **No rate limiting** on public endpoints; Telegram auth should be the only
   gate.
8. **Repository hygiene** — a ~50 MB `cloudflared-linux-amd64.deb` binary and
   dozens of legacy tarballs are committed; both should be removed/archived.
9. **No monitoring/logging** beyond console; no structured error reporting.
10. **CORS / nginx hardening** — no explicit security headers in the repo.
