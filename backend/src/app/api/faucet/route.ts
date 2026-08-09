import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { balances: true }
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if faucet was already used (we can check if they already have exactly 10,000 USDT or similar, or just allow it for demo)
    // For demo purposes, we will just give them 2 ETH and 10000 USDT if they have low balance.

    let hash = '0x';
    for (let i = 0; i < 64; i++) hash += Math.floor(Math.random() * 16).toString(16);

    await prisma.$transaction([
      prisma.walletBalance.upsert({
        where: { userId_tokenId: { userId: user.id, tokenId: 'eth' } },
        update: { balance: { increment: 2 } },
        create: { userId: user.id, tokenId: 'eth', balance: 2 }
      }),
      prisma.walletBalance.upsert({
        where: { userId_tokenId: { userId: user.id, tokenId: 'usdt' } },
        update: { balance: { increment: 10000 } },
        create: { userId: user.id, tokenId: 'usdt', balance: 10000 }
      }),
      prisma.transaction.create({
        data: {
          userId: user.id,
          type: 'recv',
          tokenId: 'eth',
          amount: 2,
          fiatValue: 6800, // rough est
          hash: hash,
          note: 'Faucet Deposit',
          status: 'success'
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Faucet API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
