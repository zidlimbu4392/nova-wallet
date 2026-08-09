import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/lib/auth';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { walletAddress, cardBg, cardColor, cardName } = body;

    if (!walletAddress || typeof walletAddress !== 'string') {
      return NextResponse.json({ error: 'walletAddress is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: auth.userId },
      data: {
        hasCard: true,
        walletAddress: walletAddress,
        cardBg: cardBg || null,
        cardColor: cardColor || null,
        cardName: cardName || null
      }
    });

    return NextResponse.json({ success: true, hasCard: updatedUser.hasCard });
  } catch (error) {
    console.error('Wallet Issue API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
