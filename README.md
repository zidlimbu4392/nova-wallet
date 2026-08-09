# 🚀 Nova Wallet — Telegram Mini App

> Full-stack crypto wallet portfolio built as a Telegram Mini App with real-time price tracking, swap/send/stake functionality, and admin dashboard.

## 📸 Features

### 💰 Dashboard
- **9 crypto tokens** with real-time prices from Binance API
- Animated balance counter with 24h portfolio change
- Interactive sparkline chart
- Send / Receive / Swap quick actions

### 📊 Token Details
- Per-token price chart (sparkline)
- Filtered transaction history
- Buy/Sell with one tap (routes to Swap)

### 🔄 Send / Swap / Stake
- **Send** — validates address, checks balance, writes to PostgreSQL
- **Swap** — calculates rate from live prices, applies slippage
- **Stake** — 5 staking pools with real APY tracking

### 🖼️ NFT Gallery
- 6 NFTs with procedural SVG art generation
- Collection grouping, floor price tracking
- Sell/Share actions

### 🔐 Security
- Telegram `initData` HMAC-SHA256 signature validation
- Zod schema validation on all POST endpoints
- Auto-user registration on first Telegram visit

### 📈 Live Prices
- Cron job updates prices every 5 minutes from Binance
- 24h price change percentage
- Frontend auto-refreshes every 60 seconds

### 🔧 Admin Panel
- `/admin` — dark-themed dashboard
- View all tokens, users, transactions, staking pools
- Real-time database stats

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│  Telegram Mini App (Frontend)                   │
│  HTML + CSS + Vanilla JS                        │
│  ┌───────────┬──────────┬──────────┬──────────┐ │
│  │ Dashboard │  NFT     │  Staking │ Activity │ │
│  ├───────────┼──────────┼──────────┼──────────┤ │
│  │ Send      │  Receive │  Swap    │ Token    │ │
│  └───────────┴──────────┴──────────┴──────────┘ │
│                    ↕ fetch()                     │
├─────────────────────────────────────────────────┤
│  Nginx Reverse Proxy (:80)                      │
│  ├── /assets/* → Static files                   │
│  ├── /api/*    → Next.js Backend                │
│  └── /admin/*  → Admin Panel                    │
├─────────────────────────────────────────────────┤
│  Next.js Backend (:3000)                        │
│  ├── GET  /api/wallet      → Dashboard data     │
│  ├── GET  /api/token/:id   → Token details      │
│  ├── POST /api/send        → Transfer tokens     │
│  ├── POST /api/swap        → Swap tokens         │
│  ├── POST /api/stake       → Stake in pool       │
│  ├── GET  /api/cron/prices → Update prices       │
│  └── GET  /admin           → Admin dashboard     │
│                                                  │
│  Middleware:                                     │
│  ├── Telegram Auth (HMAC-SHA256)                 │
│  ├── Zod Validation (Send/Swap/Stake schemas)    │
│  └── Prisma ORM                                  │
├─────────────────────────────────────────────────┤
│  PostgreSQL (:5432)                              │
│  ├── User (telegramId, walletAddress)            │
│  ├── Token (prices, icons, 24h change)           │
│  ├── WalletBalance (userId ↔ tokenId)            │
│  ├── Transaction (send/recv/swap/stake)          │
│  ├── UserNFT (art data, collection)              │
│  └── StakingPool (APY, TVL, rewards)             │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla JS, CSS3, HTML5 |
| **Backend** | Next.js 16 (App Router) |
| **Database** | PostgreSQL 15 |
| **ORM** | Prisma 5 |
| **Validation** | Zod |
| **Auth** | Telegram WebApp initData (HMAC-SHA256) |
| **Prices** | Binance API (real-time) |
| **Deploy** | Docker Compose (nginx + node + postgres) |
| **Admin** | React Server Components |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 1. Clone & Configure

```bash
git clone https://github.com/your-username/nova-wallet.git
cd nova-wallet

# Optional: set Telegram bot token for production auth
# Leave empty for dev mode (uses demo_user)
echo "BOT_TOKEN=your_bot_token_here" > .env
```

### 2. Start

```bash
docker compose up -d --build
```

### 3. Seed Database

```bash
docker exec -it nova-wallet-backend npx --yes tsx prisma/seed.ts
```

### 4. Access

| URL | Description |
|-----|-------------|
| `http://localhost:8080` | Wallet App |
| `http://localhost:8080/admin` | Admin Panel |
| `http://localhost:5050` | pgAdmin (admin@nova.com / admin) |

---

## 📁 Project Structure

```
nova-wallet/
├── index.html                 # SPA entry point
├── nginx.conf                 # Reverse proxy config
├── docker-compose.yml         # Multi-container orchestration
├── Dockerfile                 # Nginx frontend container
├── assets/
│   ├── icons/                 # Token SVG icons (BTC, ETH, SOL, etc.)
│   ├── nft/                   # NFT artwork (WebP)
│   ├── styles/
│   │   ├── base.css           # Design tokens, variables
│   │   ├── components.css     # Reusable UI components
│   │   └── screens.css        # Screen-specific styles
│   └── js/
│       ├── app.js             # Router, navigation, Telegram integration
│       ├── store.js           # State management + API client
│       ├── ui.js              # UI helpers, icons, formatters, QR
│       ├── data.js            # Fallback mock data
│       └── screens/
│           ├── dashboard.js   # Main wallet dashboard
│           ├── token.js       # Token detail + chart
│           ├── activity.js    # Transaction history
│           ├── send.js        # Send tokens (POST /api/send)
│           ├── receive.js     # QR code + address
│           ├── swap.js        # Token swap (POST /api/swap)
│           ├── staking.js     # Staking pools (POST /api/stake)
│           └── nft.js         # NFT gallery
└── backend/
    ├── Dockerfile             # Node.js + cron container
    ├── package.json           # Dependencies (next, prisma, zod)
    ├── prisma/
    │   ├── schema.prisma      # Database schema (6 models)
    │   └── seed.ts            # Seed data with Binance prices
    └── src/
        ├── lib/
        │   ├── auth.ts        # Request authentication
        │   ├── telegram-auth.ts # HMAC-SHA256 validation
        │   ├── schemas.ts     # Zod validation schemas
        │   └── prisma.ts      # Singleton client
        └── app/
            ├── admin/page.tsx # Admin dashboard (RSC)
            └── api/
                ├── wallet/    # GET  — dashboard data
                ├── token/[id] # GET  — token details
                ├── send/      # POST — transfer tokens
                ├── swap/      # POST — swap tokens
                ├── stake/     # POST — stake in pool
                └── cron/prices/ # GET — update prices
```

---

## 🔌 API Reference

### `GET /api/wallet`
Returns dashboard data: balances, transactions, NFTs, staking pools.

### `GET /api/token/:id`
Returns token details with price sparkline and filtered transaction history.

### `POST /api/send`
```json
{ "tokenId": "eth", "amount": 1.5, "toAddress": "0x..." }
```

### `POST /api/swap`
```json
{ "fromTokenId": "eth", "toTokenId": "usdt", "amount": 1.0, "slippage": 0.5 }
```

### `POST /api/stake`
```json
{ "poolId": "lido", "amount": 1.0 }
```

### `GET /api/cron/prices`
Updates all token prices from Binance. Protected by `Authorization: Bearer <CRON_SECRET>`.

---

## 📄 License

MIT
