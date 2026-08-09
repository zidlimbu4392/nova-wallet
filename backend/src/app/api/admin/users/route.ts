import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users — Returns all users with balances (admin only)
 */
export async function GET(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const users = await prisma.user.findMany({
      include: {
        balances: { include: { token: true } },
        transactions: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalUsers = users.length;
    const totalVolume = await prisma.transaction.aggregate({
      _sum: { fiatValue: true }
    });

    const mapped = users.map(u => {
      const totalBalance = u.balances.reduce((sum, b) => sum + b.balance * (b.token?.priceUsd || 0), 0);
      return {
        id: u.id,
        telegramId: u.telegramId,
        username: u.username,
        isAdmin: u.isAdmin,
        walletAddress: u.walletAddress,
        totalBalance,
        txCount: u.transactions.length,
        lastTx: u.transactions[0]?.createdAt || null,
        createdAt: u.createdAt,
        balances: u.balances.map(b => ({
          token: b.token?.symbol || b.tokenId,
          amount: b.balance,
          usd: b.balance * (b.token?.priceUsd || 0)
        }))
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalVolume: totalVolume._sum.fiatValue || 0,
      },
      users: mapped
    });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/users — Update user (toggle admin, set KYC level, etc.)
 */
export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { userId, action, value } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    switch (action) {
      case 'toggleAdmin': {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
        await prisma.user.update({
          where: { id: userId },
          data: { isAdmin: !user.isAdmin }
        });
        break;
      }
      case 'addBalance': {
        const { tokenId, amount } = value || {};
        if (!tokenId || !amount) return NextResponse.json({ error: 'Missing tokenId/amount' }, { status: 400 });
        await prisma.walletBalance.upsert({
          where: { userId_tokenId: { userId, tokenId } },
          update: { balance: { increment: amount } },
          create: { userId, tokenId, balance: amount }
        });
        break;
      }
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
