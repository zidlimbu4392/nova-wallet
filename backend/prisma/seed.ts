import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchBinancePrice(symbol: string): Promise<{price: number, change: number}> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
    if (!res.ok) return { price: 0, change: 0 };
    const data = await res.json();
    return { price: parseFloat(data.lastPrice), change: parseFloat(data.priceChangePercent) };
  } catch (e) {
    console.error(`Error fetching price for ${symbol}:`, e);
    return { price: 0, change: 0 };
  }
}

function randomHash(): string {
  let h = '0x';
  for (let i = 0; i < 64; i++) h += Math.floor(Math.random() * 16).toString(16);
  return h;
}

function randomAddr(): string {
  let h = '0x';
  for (let i = 0; i < 40; i++) h += Math.floor(Math.random() * 16).toString(16);
  return h;
}

async function main() {
  console.log('Fetching live prices from Binance...');
  
  const btc = await fetchBinancePrice('BTC');
  const eth = await fetchBinancePrice('ETH');
  const sol = await fetchBinancePrice('SOL');
  const ton = await fetchBinancePrice('TON');
  const pol = await fetchBinancePrice('POL');
  const link = await fetchBinancePrice('LINK');

  console.log('Seeding tokens with real prices...');
  
  const tokens = [
    { id: 'btc',  symbol: 'BTC',  name: 'Bitcoin',   priceUsd: btc.price || 64000,  change24: btc.change || 2.5,   icon: 'BTC.svg',              color: '#F7931A', glyph: '₿', chain: 'Bitcoin' },
    { id: 'eth',  symbol: 'ETH',  name: 'Ethereum',  priceUsd: eth.price || 3500,   change24: eth.change || 1.2,   icon: 'svgviewer-output.svg',  color: '#627EEA', glyph: 'Ξ', chain: 'Ethereum' },
    { id: 'sol',  symbol: 'SOL',  name: 'Solana',    priceUsd: sol.price || 140,    change24: sol.change || -0.5,  icon: 'SOL.svg',              color: '#14F195', glyph: '◎', chain: 'Solana' },
    { id: 'ton',  symbol: 'TON',  name: 'Toncoin',   priceUsd: ton.price || 7.5,    change24: ton.change || 5.4,   icon: 'TON.svg',              color: '#0098EA', glyph: 'T', chain: 'TON' },
    { id: 'usdt', symbol: 'USDT', name: 'Tether',    priceUsd: 1.0,                 change24: 0.01,                icon: 'USDT.svg',             color: '#26A17B', glyph: '₮', chain: 'Ethereum' },
    { id: 'usdc', symbol: 'USDC', name: 'USD Coin',  priceUsd: 1.0,                 change24: -0.02,               icon: 'USDC.svg',             color: '#2775CA', glyph: '$', chain: 'Ethereum' },
    { id: 'pol',  symbol: 'POL',  name: 'Polygon',   priceUsd: pol.price || 0.4,    change24: pol.change || 1.1,   icon: 'POL.svg',              color: '#8247E5', glyph: '◆', chain: 'Polygon' },
    { id: 'link', symbol: 'LINK', name: 'Chainlink',  priceUsd: link.price || 14.5,  change24: link.change || 3.2,  icon: 'LINK.svg',             color: '#2A5ADA', glyph: '⬡', chain: 'Ethereum' },
    { id: 'gram', symbol: 'GRAM', name: 'Gram',      priceUsd: 0.015,               change24: 12.4,                icon: 'GRAM.svg',             color: '#0098EA', glyph: 'G', chain: 'TON' },
  ];

  for (const t of tokens) {
    await prisma.token.upsert({
      where: { symbol: t.symbol },
      update: { priceUsd: t.priceUsd, change24: t.change24, icon: t.icon, color: t.color, glyph: t.glyph, chain: t.chain },
      create: t,
    });
  }

  console.log('Creating/updating user and balances...');
  
  // Create user if not exists, with a generated wallet address
  const walletAddr = '0x7A3F4c91b2E8d6F5a01C9b4D7e2F8A1c3B6E5d94';
  const user = await prisma.user.upsert({
    where: { telegramId: 'demo_user' },
    update: { walletAddress: walletAddr },
    create: {
      telegramId: 'demo_user',
      username: 'DemoTrader',
      walletAddress: walletAddr,
      isAdmin: true,
    }
  });

  // Always upsert all 9 balances (this fixes the "only 4 tokens" bug)
  const balances = [
    { tokenId: 'btc',  balance: 0.15 },
    { tokenId: 'eth',  balance: 2.4 },
    { tokenId: 'usdt', balance: 1543.20 },
    { tokenId: 'ton',  balance: 150 },
    { tokenId: 'sol',  balance: 45.5 },
    { tokenId: 'usdc', balance: 500 },
    { tokenId: 'pol',  balance: 1250 },
    { tokenId: 'link', balance: 80 },
    { tokenId: 'gram', balance: 150000 },
  ];

  for (const b of balances) {
    await prisma.walletBalance.upsert({
      where: { userId_tokenId: { userId: user.id, tokenId: b.tokenId } },
      update: { balance: b.balance },
      create: { userId: user.id, tokenId: b.tokenId, balance: b.balance },
    });
  }

  // Clear old transactions and create fresh ones
  await prisma.transaction.deleteMany({ where: { userId: user.id } });

  console.log('Generating transaction history...');

  const txData = [];

  // Generate 15 realistic transactions
  for (let i = 0; i < 15; i++) {
    const typeRoll = Math.random();
    const type = typeRoll < 0.33 ? 'recv' : typeRoll < 0.66 ? 'send' : 'swap';
    const token = tokens[Math.floor(Math.random() * tokens.length)];
    
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 10));
    date.setHours(date.getHours() - Math.floor(Math.random() * 24));
    
    const amt = parseFloat((Math.random() * 10 + 0.01).toFixed(4));
    const fiatVal = parseFloat((amt * token.priceUsd).toFixed(2));
    const fee = parseFloat((Math.random() * 2 + 0.01).toFixed(2));

    if (type === 'recv') {
      txData.push({
        userId: user.id,
        type: 'recv',
        tokenId: token.id,
        amount: amt,
        fiatValue: fiatVal,
        fromAddr: randomAddr(),
        hash: randomHash(),
        fee: fee,
        status: 'success',
        createdAt: date
      });
    } else if (type === 'send') {
      txData.push({
        userId: user.id,
        type: 'send',
        tokenId: token.id,
        amount: amt,
        fiatValue: fiatVal,
        toAddress: randomAddr(),
        hash: randomHash(),
        fee: fee,
        status: Math.random() > 0.9 ? 'failed' : 'success',
        createdAt: date
      });
    } else {
      const tokenOut = tokens[Math.floor(Math.random() * tokens.length)];
      txData.push({
        userId: user.id,
        type: 'swap',
        tokenId: token.id,
        amount: amt,
        fiatValue: fiatVal,
        hash: randomHash(),
        fee: fee,
        note: `${token.symbol}→${tokenOut.symbol}`,
        status: 'success',
        createdAt: date
      });
    }
  }

  await prisma.transaction.createMany({ data: txData });

  // Seed staking pools
  console.log('Seeding staking pools...');
  const pools = [
    { id: 'lido',  asset: 'ETH',  name: 'Lido',              apy: 3.8,  tvl: '8.2B',  staked: 1.0,  rewards: 0.038, color: '#627EEA', glyph: 'Ξ' },
    { id: 'marin', asset: 'SOL',  name: 'Marinade',           apy: 6.4,  tvl: '1.4B',  staked: 50.0, rewards: 3.2,   color: '#14F195', glyph: '◎' },
    { id: 'aave',  asset: 'USDC', name: 'Aave V3',            apy: 4.2,  tvl: '12.1B', staked: 0,    rewards: 0,     color: '#2775CA', glyph: '$' },
    { id: 'chain', asset: 'LINK', name: 'Chainlink Staking',  apy: 5.1,  tvl: '680M',  staked: 0,    rewards: 0,     color: '#2A5ADA', glyph: '⬡' },
    { id: 'tonstk',asset: 'TON',  name: 'TON Staking',        apy: 5.9,  tvl: '3.2B',  staked: 0,    rewards: 0,     color: '#0098EA', glyph: 'T' },
  ];
  for (const p of pools) {
    await prisma.stakingPool.upsert({
      where: { id: p.id },
      update: { apy: p.apy, tvl: p.tvl, color: p.color, glyph: p.glyph },
      create: p,
    });
  }

  // Seed NFTs
  console.log('Seeding NFT collection...');
  const existingNfts = await prisma.userNFT.count({ where: { userId: user.id } });
  if (existingNfts === 0) {
    const nfts = [
      { userId: user.id, name: 'Cosmic Drifter #418',  collection: 'Aurora Punks',    floorPrice: 2.4,  image: 'assets/nft/nft1.webp', artType: 'rings', artFrom: '#FF6B9D', artTo: '#A86BFF' },
      { userId: user.id, name: 'Neon Tiger #072',      collection: 'Wild Neon',        floorPrice: 1.8,  image: 'assets/nft/nft2.webp', artType: 'tri',   artFrom: '#00D4FF', artTo: '#7C5CFF' },
      { userId: user.id, name: 'Zen Garden #1056',     collection: 'Minimal Worlds',   floorPrice: 0.9,  image: 'assets/nft/nft3.webp', artType: 'circ',  artFrom: '#34D399', artTo: '#06B6D4' },
      { userId: user.id, name: 'Solar Flare #31',      collection: 'Cosmic Signs',     floorPrice: 3.1,  image: 'assets/nft/nft4.webp', artType: 'sun',   artFrom: '#FFB020', artTo: '#FF5E3A' },
      { userId: user.id, name: 'Chrome Bird #884',     collection: 'Aurora Punks',     floorPrice: 2.4,  image: 'assets/nft/nft5.webp', artType: 'rings', artFrom: '#A86BFF', artTo: '#5B7CFF' },
      { userId: user.id, name: 'Deep Wave #090',       collection: 'Wild Neon',        floorPrice: 1.8,  image: 'assets/nft/nft6.webp', artType: 'wave',  artFrom: '#7C5CFF', artTo: '#00D4FF' },
    ];
    await prisma.userNFT.createMany({ data: nfts });
  }

  console.log(`Seeding finished! ${tokens.length} tokens, ${balances.length} balances, ${txData.length} transactions, ${pools.length} pools, 6 NFTs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
