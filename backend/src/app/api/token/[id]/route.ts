import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id: tokenId } = await params;

    // Get token info
    const token = await prisma.token.findUnique({ where: { id: tokenId } });
    if (!token) {
      return NextResponse.json({ error: 'Token not found' }, { status: 404 });
    }

    // Get user's balance for this token
    const balance = await prisma.walletBalance.findUnique({
      where: { userId_tokenId: { userId: auth.userId, tokenId } }
    });

    // Get transactions for this token
    const transactions = await prisma.transaction.findMany({
      where: { userId: auth.userId, tokenId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // Generate price history (24 data points for sparkline)
    // In production, this would come from a price history table
    const basePrice = token.priceUsd;
    const volatility = Math.abs(token.change24) / 100 || 0.02;
    const priceHistory: number[] = [];
    for (let i = 23; i >= 0; i--) {
      const noise = (Math.random() - 0.5) * 2 * volatility;
      const timeFactor = (token.change24 / 100) * (i / 24);
      priceHistory.push(basePrice * (1 - timeFactor + noise));
    }
    priceHistory.push(basePrice); // current price is last

    // Format transactions
    const now = new Date();
    const formattedTxs = transactions.map(tx => {
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

      return {
        id: tx.id,
        type: tx.type,
        token: token.symbol,
        amount: tx.amount,
        fiat: tx.fiatValue || 0,
        time: `${dayPart}, ${timeHM}`,
        status: tx.status,
        hash: tx.hash || undefined
      };
    });

    return NextResponse.json({
      token: {
        id: token.id,
        symbol: token.symbol,
        name: token.name,
        price: token.priceUsd,
        change24: token.change24,
        icon: token.icon,
        color: token.color,
        glyph: token.glyph,
        chain: token.chain
      },
      balance: balance?.balance || 0,
      fiatValue: (balance?.balance || 0) * token.priceUsd,
      priceHistory,
      transactions: formattedTxs
    });
  } catch (error) {
    console.error('Token API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
