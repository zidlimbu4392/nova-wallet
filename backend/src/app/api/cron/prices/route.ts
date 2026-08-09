import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

const BINANCE_SYMBOLS = ['BTC', 'ETH', 'SOL', 'TON', 'POL', 'LINK'];

async function fetchBinancePrice(symbol: string): Promise<{price: number, change: number}> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`);
    if (!res.ok) return { price: 0, change: 0 };
    const data = await res.json();
    return { price: parseFloat(data.lastPrice), change: parseFloat(data.priceChangePercent) };
  } catch {
    return { price: 0, change: 0 };
  }
}

export async function GET(request: Request) {
  try {
    // Verify cron secret (simple bearer token auth)
    const cronSecret = process.env.CRON_SECRET || 'dev-cron-secret';
    const authHeader = request.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON] Updating prices from Binance...');
    let updated = 0;

    for (const symbol of BINANCE_SYMBOLS) {
      const { price, change } = await fetchBinancePrice(symbol);
      if (price > 0) {
        // Find token by symbol
        const token = await prisma.token.findUnique({ where: { symbol } });
        if (token) {
          await prisma.token.update({
            where: { symbol },
            data: { priceUsd: price, change24: change }
          });
          updated++;
          console.log(`  ${symbol}: $${price.toFixed(2)} (${change > 0 ? '+' : ''}${change.toFixed(2)}%)`);
        }
      }
    }

    console.log(`[CRON] Updated ${updated}/${BINANCE_SYMBOLS.length} tokens`);

    return NextResponse.json({
      success: true,
      updated,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CRON] Price update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
