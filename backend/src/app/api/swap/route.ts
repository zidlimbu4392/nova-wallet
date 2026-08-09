import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Authenticate (falls back to demo_user in dev mode)
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: {
        balances: {
          include: { token: true }
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20
        },
        nfts: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const allTokens = await prisma.token.findMany({ orderBy: { priceUsd: 'desc' } });
    const userBalances = new Map(user.balances.map(b => [b.tokenId, b.balance]));

    // --- REAL ON-CHAIN BALANCE FETCH ---
    let realMaticBalance = 0;
    if (user.walletAddress && process.env.ALCHEMY_URL) {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.ALCHEMY_URL);
        const balanceWei = await provider.getBalance(user.walletAddress);
        realMaticBalance = parseFloat(ethers.formatEther(balanceWei));
      } catch (err) {
        console.error('Failed to fetch on-chain balance:', err);
      }
    }

    // Map all tokens — matching data.js format exactly
    const balances = allTokens.map(t => {
      let balance = userBalances.get(t.id) || 0;
      
      // Inject real balance for MATIC/POL
      if (t.symbol === 'MATIC' || t.symbol === 'POL') {
        balance = realMaticBalance || balance; 
      }

      return {
        id: t.id,
        symbol: t.symbol,
        name: t.name,
        balance,
        price: t.priceUsd,
        change24: t.change24,
        icon: t.icon,
        color: t.color,
        glyph: t.glyph,
        chain: t.chain
      };
    });

    const totalBalance = balances.reduce((sum, b) => sum + (b.balance * b.price), 0);

    // Build tokenId → token map for transactions
    const tokenMap: Record<string, any> = {};
    allTokens.forEach(t => { tokenMap[t.id] = t; });

    // Map transactions — matching data.js TXS format EXACTLY
    const now = new Date();
    const formattedTxs = user.transactions.map(tx => {
      const tok = tx.tokenId ? tokenMap[tx.tokenId] : null;
      const symbol = tok?.symbol || '';

      const txDate = new Date(tx.createdAt);
      const isToday = txDate.toDateString() === now.toDateString();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = txDate.toDateString() === yesterday.toDateString();
      
      const timeHM = txDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      let dayPart: string;
      if (isToday) dayPart = 'Today';
      else if (isYesterday) dayPart = 'Yesterday';
      else dayPart = txDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const timeStr = `${dayPart}, ${timeHM}`;

      let tokenStr = symbol;
      if (tx.type === 'swap' && tx.note) {
        tokenStr = tx.note;
      }

      return {
        id: tx.id,
        type: tx.type,
        token: tokenStr,
        amount: tx.amount,
        fiat: tx.fiatValue || 0,
        time: timeStr,
        status: tx.status,
        from: tx.fromAddr || undefined,
        to: tx.toAddress || undefined,
        hash: tx.hash || undefined,
        fee: tx.fee || undefined,
        rate: tx.type === 'swap' && tx.note ? `1 ${symbol} = ${(tok?.priceUsd || 0).toLocaleString()} USDT` : undefined,
        note: tx.note || undefined
      };
    });

    // Get staking pools
    const pools = await prisma.stakingPool.findMany();

    // Map NFTs to match frontend format
    const nfts = user.nfts.map(n => ({
      id: n.id,
      name: n.name,
      collection: n.collection,
      floor: n.floorPrice,
      img: n.image,
      art: { type: 'grad', from: n.artFrom || '#667eea', to: n.artTo || '#764ba2', shape: n.artType || 'rings' }
    }));

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        totalBalance,
        isAdmin: user.isAdmin,
        hasCard: user.hasCard,
        cardBg: user.cardBg,
        cardColor: user.cardColor,
        cardName: user.cardName,
        walletAddress: user.walletAddress || '0x0000000000000000000000000000000000000000',
        ens: user.username ? user.username.toLowerCase() + '.eth' : 'nova.eth'
      },
      balances,
      transactions: formattedTxs,
      nfts,
      pools: pools.map(p => ({
        id: p.id,
        asset: p.asset,
        name: p.name,
        apy: p.apy,
        tvl: p.tvl,
        staked: p.staked,
        rewards: p.rewards,
        color: p.color,
        glyph: p.glyph
      }))
    });
  } catch (error) {
    console.error('Wallet API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
