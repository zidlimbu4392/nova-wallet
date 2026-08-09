import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { SendSchema, SendPayloadSchema } from '@/lib/schemas';
import { authenticateRequest } from '@/lib/auth';
import { ethers } from 'ethers';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Auth
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Parse & validate
    const body = await request.json();
    const parsed = SendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }
    const { payload, signature } = parsed.data;

    // Verify signature
    let recoveredAddress: string;
    try {
      recoveredAddress = ethers.verifyMessage(payload, signature);
    } catch (e) {
      return NextResponse.json({ error: 'Invalid crypto signature' }, { status: 400 });
    }

    // Check if the signature matches the user's registered wallet
    const user = await prisma.user.findUnique({ where: { id: auth.userId } });
    if (!user || !user.walletAddress || recoveredAddress.toLowerCase() !== user.walletAddress.toLowerCase()) {
      return NextResponse.json({ error: 'Signature does not match your registered wallet' }, { status: 403 });
    }

    const payloadParsed = SendPayloadSchema.safeParse(JSON.parse(payload));
    if (!payloadParsed.success) {
      return NextResponse.json({ error: 'Invalid payload content' }, { status: 400 });
    }

    const { tokenId, amount, toAddress } = payloadParsed.data;

    // Check balance
    const balance = await prisma.walletBalance.findUnique({
      where: { userId_tokenId: { userId: auth.userId, tokenId } },
      include: { token: true }
    });
    if (!balance || balance.balance < amount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Calculate fee (realistic: 0.1-2% of token value)
    const fee = parseFloat((Math.random() * 1.5 + 0.1).toFixed(2));
    const fiatValue = parseFloat((amount * balance.token.priceUsd).toFixed(2));

    // Generate tx hash
    let hash = '0x';
    for (let i = 0; i < 64; i++) hash += Math.floor(Math.random() * 16).toString(16);

    // Execute in transaction
    const [updatedBalance, tx] = await prisma.$transaction([
      prisma.walletBalance.update({
        where: { userId_tokenId: { userId: auth.userId, tokenId } },
        data: { balance: { decrement: amount } }
      }),
      prisma.transaction.create({
        data: {
          userId: auth.userId,
          type: 'send',
          tokenId,
          amount,
          fiatValue,
          toAddress,
          hash,
          fee,
          status: 'success'
        }
      })
    ]);

    return NextResponse.json({
      success: true,
      transaction: {
        id: tx.id,
        type: 'send',
        token: balance.token.symbol,
        amount,
        fiat: fiatValue,
        hash,
        fee,
        status: 'success'
      },
      newBalance: updatedBalance.balance
    });
  } catch (error) {
    console.error('Send API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
