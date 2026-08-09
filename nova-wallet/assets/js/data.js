/* ==========================================================================
   Nova Wallet — Mock data (реалистичные данные для портфолио-демо)
   ========================================================================== */

window.NovaData = (function () {
  "use strict";

  // Адрес кошелька (реалистичный Ethereum-подобный)
  const WALLET_ADDRESS = "0x7A3F4c91b2E8d6F5a01C9b4D7e2F8A1c3B6E5d94";

  const WALLET = {
    name: "Main Wallet",
    ens: "nova.eth",
    address: WALLET_ADDRESS,
    avatarInitial: "N"
  };

  // Токены с балансами и курсами (≈ реалистичные на момент демо)
  const TOKENS = [
    {
      id: "eth", symbol: "ETH", name: "Ethereum",
      balance: 4.8231, price: 3420.55, change24: 2.84,
      color: "#627EEA", icon: "assets/icons/eth.svg", glyph: "Ξ", icon: "assets/icons/eth.svg?v=36", chain: "Ethereum"
    },
    {
      id: "btc", symbol: "BTC", name: "Bitcoin",
      balance: 0.3412, price: 67240.18, change24: 1.42,
      color: "#F7931A", icon: "assets/icons/BTC.svg", glyph: "₿", icon: "assets/icons/BTC.svg?v=36", chain: "Ethereum (wrapped)"
    },
    {
      id: "sol", symbol: "SOL", name: "Solana",
      balance: 124.5, price: 168.92, change24: 5.71,
      color: "#14F195→#9945FF", glyph: "◎", icon: "assets/icons/SOL.svg?v=36", chain: "Solana"
    },
    {
      id: "usdt", symbol: "USDT", name: "Tether USD",
      balance: 8450.00, price: 1.0, change24: 0.01,
      color: "#26A17B", icon: "assets/icons/USDT.svg", glyph: "₮", icon: "assets/icons/USDT.svg?v=36", chain: "Ethereum"
    },
    {
      id: "usdc", symbol: "USDC", name: "USD Coin",
      balance: 2120.55, price: 1.0, change24: -0.02,
      color: "#2775CA", icon: "assets/icons/USDC.svg", glyph: "$", icon: "assets/icons/USDC.svg?v=36", chain: "Ethereum"
    },
    {
      id: "matic", symbol: "MATIC", name: "Polygon",
      balance: 3200.0, price: 0.7124, change24: -1.85,
      color: "#8247E5", icon: "assets/icons/POL.svg", glyph: "◆", icon: "assets/icons/POL.svg?v=36", chain: "Polygon"
    },
    {
      id: "link", symbol: "LINK", name: "Chainlink",
      balance: 88.4, price: 14.62, change24: 3.27,
      color: "#2A5ADA", icon: "assets/icons/LINK.svg", glyph: "⬡", icon: "assets/icons/LINK.svg?v=36", chain: "Ethereum"
    },
    {
      id: "arb", symbol: "ARB", name: "Arbitrum",
      balance: 1420.0, price: 0.9845, change24: -0.94,
      color: "#28A0F0", glyph: "▲", chain: "Arbitrum"
    }
  ];

  // Спарклайн (24 точки) для графика баланса
  const SPARK = [
    24820, 24910, 24760, 25010, 25180, 25090, 25320, 25410,
    25280, 25560, 25690, 25540, 25810, 25920, 25760, 26010,
    26180, 26090, 26340, 26420, 26280, 26560, 26690, 26820
  ];

  // Транзакции
  const TXS = [
    { id: 1, type: "recv", token: "ETH", amount: 1.5, fiat: 5130.82, time: "Сегодня, 14:22", status: "success", from: "0x9b2a...c41f", hash: "0x4f2a8b1e7d3c5a9f0b6e2d8c1a4f7b3e9d6c5a2f8b1e4d7c3a9f0b6e2d8c1a4", note: "От vitalik.eth" },
    { id: 2, type: "swap", token: "USDT→ETH", amount: 2000, fiat: 2000.0, time: "Сегодня, 11:08", status: "success", hash: "0x8a1d3c5b9e7f2a4c6d8b1e3f5a7c9d2b4e6f8a1c3d5b7e9f2a4c6d8b1e3f5a7c", rate: "1 ETH = 3,420.55 USDT" },
    { id: 3, type: "send", token: "USDC", amount: 250.0, fiat: 250.0, time: "Вчера, 22:45", status: "success", to: "0x1f6e...8a3b", hash: "0x2c5b7e9f1a3d4c6b8e0f2a4c6d8b1e3f5a7c9d2b4e6f8a1c3d5b7e9f2a4c6d8b", fee: 0.42 },
    { id: 4, type: "stake", token: "SOL", amount: 50.0, fiat: 8446.0, time: "Вчера, 16:30", status: "success", pool: "Marinade Finance", hash: "0x5d8b1e3f6a9c2b4d7e0f1a3c5b8e2d4f6a9c1b3d5e7f0a2c4b6d8e1f3a5c7b9d" },
    { id: 5, type: "recv", token: "USDT", amount: 500.0, fiat: 500.0, time: "Вчера, 09:14", status: "success", from: "0xc3a1...f02e", hash: "0x7e2d4f6a8c1b3d5e7f9a2c4b6d8e0f2a4c6b8e1d3f5a7c9b2e4d6f8a0c3b5e7d" },
    { id: 6, type: "send", token: "ETH", amount: 0.25, fiat: 855.14, time: "20 июня, 19:02", status: "success", to: "0x4a8c...e1d7", hash: "0x9f1a3c5b7e2d4f6a8c0b2e4d6f8a1c3b5e7d9f2a4c6b8e0d2f4a6c8b1e3d5f7a", fee: 0.38 },
    { id: 7, type: "swap", token: "ETH→USDC", amount: 0.8, fiat: 2736.44, time: "20 июня, 12:48", status: "success", hash: "0x3b5e7d9f1a3c5b8e0d2f4a6c8b1e3d5f7a9c2b4e6d8a0f2c4b6e8d1a3f5c7b9e", rate: "1 ETH = 3,420.55 USDC" },
    { id: 8, type: "stake", token: "ETH", amount: 1.0, fiat: 3420.55, time: "19 июня, 10:20", status: "pending", pool: "Lido", hash: "0x6c8b0e2d4f6a8c1b3d5e7f9a2c4b6d8e0f2a4c6b8e1d3f5a7c9b2e4d6f8a0c2b" },
    { id: 9, type: "recv", token: "LINK", amount: 12.0, fiat: 175.44, time: "19 июня, 08:05", status: "success", from: "0x2e7a...b9c4", hash: "0x1d3f5a7c9b2e4d6f8a0c2b4e6d8a1f3c5b7e9d2a4c6b8e0f2d4a6c8b1e3f5a7c" },
    { id: 10, type: "send", token: "MATIC", amount: 400.0, fiat: 284.96, time: "18 июня, 17:33", status: "failed", to: "0x8d4f...2a1e", hash: "0xf2a4c6b8e0d2f4a6c8b1e3d5f7a9c2b4e6d8a0f2c4b6e8d1a3f5c7b9e0d2f4a", fee: 0.15 }
  ];

  // NFT-коллекция
  const NFTS = [
    { id: 1, name: "Cosmic Drifter #418", collection: "Aurora Punks", floor: 2.4, art: { type: "grad", from: "#FF6B9D", to: "#A86BFF", shape: "rings" } },
    { id: 2, name: "Neon Tiger #072", collection: "Wild Neon", floor: 1.8, art: { type: "grad", from: "#00D4FF", to: "#7C5CFF", shape: "tri" } },
    { id: 3, name: "Zen Garden #1056", collection: "Minimal Worlds", floor: 0.9, art: { type: "grad", from: "#34D399", to: "#06B6D4", shape: "circ" } },
    { id: 4, name: "Solar Flare #31", collection: "Cosmic Signs", floor: 3.1, art: { type: "grad", from: "#FFB020", to: "#FF5E3A", shape: "sun" } },
    { id: 5, name: "Chrome Bird #884", collection: "Aurora Punks", floor: 2.4, art: { type: "grad", from: "#A86BFF", to: "#5B7CFF", shape: "rings" } },
    { id: 6, name: "Deep Wave #090", collection: "Wild Neon", floor: 1.8, art: { type: "grad", from: "#7C5CFF", to: "#00D4FF", shape: "wave" } }
  ];

  // Пулы стейкинга
  const POOLS = [
    { id: "lido",  asset: "ETH",  name: "Lido",          apy: 3.8,  tvl: "8.2B",  staked: 1.0,  rewards: 0.038, color: "#627EEA", icon: "assets/icons/eth.svg", glyph: "Ξ", icon: "assets/icons/eth.svg?v=36" },
    { id: "marin", asset: "SOL",  name: "Marinade",      apy: 6.4,  tvl: "1.4B",  staked: 50.0, rewards: 3.2,  color: "#14F195", icon: "assets/icons/SOL.svg", glyph: "◎", icon: "assets/icons/SOL.svg?v=36" },
    { id: "aave",  asset: "USDC", name: "Aave V3",       apy: 4.2,  tvl: "12.1B", staked: 0,    rewards: 0,    color: "#2775CA", icon: "assets/icons/USDC.svg", glyph: "$", icon: "assets/icons/USDC.svg?v=36" },
    { id: "chain", asset: "LINK", name: "Chainlink Staking", apy: 5.1, tvl: "680M", staked: 0,  rewards: 0,    color: "#2A5ADA", icon: "assets/icons/LINK.svg", glyph: "⬡", icon: "assets/icons/LINK.svg?v=36" },
    { id: "matic", asset: "MATIC",name: "Polygon Staking", apy: 5.9, tvl: "3.2B", staked: 0,    rewards: 0,    color: "#8247E5", icon: "assets/icons/POL.svg", glyph: "◆", icon: "assets/icons/POL.svg?v=36" }
  ];

  // Курсовая таблица для свапа (по отношению к USD)
  const PRICES = TOKENS.reduce((m, t) => (m[t.id] = t.price, m), {});

  // Короткие имена сетей
  const NETWORKS = [
    { id: "eth", name: "Ethereum", fee: 0.42, color: "#627EEA", icon: "assets/icons/eth.svg" },
    { id: "base", name: "Base", fee: 0.02, color: "#0052FF" },
    { id: "arb", name: "Arbitrum", fee: 0.05, color: "#28A0F0" },
    { id: "op", name: "Optimism", fee: 0.04, color: "#FF0420" }
  ];

  // ----- производные хелперы -----
  function tokenFiat(t) { return t.balance * t.price; }

  function totalFiat() { return TOKENS.reduce((s, t) => s + tokenFiat(t), 0); }

  function findToken(id) { return TOKENS.find(t => t.id === id); }

  return {
    WALLET, TOKENS, SPARK, TXS, NFTS, POOLS, PRICES, NETWORKS,
    tokenFiat, totalFiat, findToken
  };
})();
