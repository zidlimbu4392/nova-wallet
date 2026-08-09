import { PrismaClient } from '@prisma/client';
import { validateInitData, extractUserUnsafe, TelegramUser } from './telegram-auth';

const prisma = new PrismaClient();

const BOT_TOKEN = process.env.BOT_TOKEN || '';
const IS_DEV = process.env.NODE_ENV !== 'production' || !BOT_TOKEN;

export interface AuthResult {
  userId: string;
  telegramId: string;
  username: string;
  isAdmin: boolean;
  hasCard: boolean;
}

/**
 * Authenticate request using Telegram initData header.
 * In dev mode (no BOT_TOKEN), falls back to demo_user.
 */
export async function authenticateRequest(request: Request): Promise<AuthResult | null> {
  const initData = request.headers.get('x-telegram-init-data') || '';

  let tgUser: TelegramUser | null = null;

  if (IS_DEV) {
    // Dev mode: try to extract user, or fall back to demo
    tgUser = extractUserUnsafe(initData);
    if (!tgUser) {
      // Fallback to demo_user for development
      const user = await prisma.user.findUnique({ where: { telegramId: 'demo_user' } });
      if (!user) return null;
      return {
        userId: user.id,
        telegramId: user.telegramId,
        username: user.username || 'DemoTrader',
        isAdmin: user.isAdmin,
        hasCard: user.hasCard
      };
    }
  } else {
    // Production: validate HMAC signature
    tgUser = validateInitData(initData, BOT_TOKEN);
    if (!tgUser) return null;
  }

  // Upsert user (auto-register on first visit)
  const telegramId = String(tgUser.id);
  const username = tgUser.username || tgUser.first_name || 'User';

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: { username },
    create: {
      telegramId,
      username,
      isAdmin: false
    }
  });

  return {
    userId: user.id,
    telegramId: user.telegramId,
    username: user.username || username,
    isAdmin: user.isAdmin,
    hasCard: user.hasCard
  };
}
