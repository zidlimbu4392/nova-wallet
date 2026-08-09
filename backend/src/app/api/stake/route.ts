import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { StakeSchema } from '@/lib/schemas';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Auth
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Parse & validate
    const body = await request.json();
    const parsed = StakeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { poolId, amount } = parsed.data;

    // Get pool
    const pool = await prisma.stakingPool.findUnique({ where: { id: poolId } });
    if (!pool) {
      return NextResponse.json({ error: 'Pool not found' }, { status: 404 });
    }

    // Find token by pool asset symbol
    const token = await prisma.token.findUnique({ where: { symbol: pool.asset } });
    if (!token) {
      return NextResponse.json({ error: 'Token not found for pool asset' }, { status: 404 });
    }

    // Check balance
    const balance = await prisma.walletBalance.findUnique({
      where: { userId_tokenId: { userId: auth.userId, tokenId: token.id } }
    });
    if (!balance || balance.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const fiatValue = parseFloat((amount * token.priceUsd).toFixed(2));
    const newStaked = parseFloat((pool.staked + amount).toFixed(6));
    const newRewards = parseFloat((newStaked * pool.apy / 100 / 12).toFixed(4));

    // Generate tx hash
    let hash = '0x';
    for (let i = 0; i < 64; i++) hash += Math.floor(Math.random() * 16).toString(16);

    // Execute: deduct balance, update pool, create tx
    await prisma.$transaction([
      prisma.walletBalance.update({
        where: { userId_tokenId: { userId: auth.userId, tokenId: token.id } },
        data: { balance: { decrement: amount } }
      }),
      prisma.stakingPool.update({
        where: { id: poolId },
        data: { staked: newStaked, rewards: newRewards }
      }),
      prisma.transaction.create({
        data: {
          userId: auth.userId,
          type: 'stake',
          tokenId: token.id,
          amount,
          fiatValue,
          hash,
          note: pool.name,
          status: 'success'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      stake: {
        pool: pool.name,
        token: token.symbol,
        amount,
        fiat: fiatValue,
        newStaked,
        newRewards,
        apy: pool.apy
      }
    });
  } catch (error) {
    console.error('Stake API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
