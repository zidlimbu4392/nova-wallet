import { z } from 'zod';

// --- Send ---
export const SendSchema = z.object({
  payload: z.string().min(1, 'Payload required'),
  signature: z.string().min(1, 'Signature required'),
});
export type SendInput = z.infer<typeof SendSchema>;

export const SendPayloadSchema = z.object({
  tokenId: z.string().min(1, 'Token ID required'),
  amount: z.number().positive('Amount must be positive'),
  toAddress: z.string().min(10, 'Invalid address').max(100),
  timestamp: z.number().optional(),
});

// --- Swap ---
export const SwapSchema = z.object({
  fromTokenId: z.string().min(1),
  toTokenId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
  slippage: z.number().min(0.01).max(50).default(0.5),
});
export type SwapInput = z.infer<typeof SwapSchema>;

// --- Stake ---
export const StakeSchema = z.object({
  poolId: z.string().min(1),
  amount: z.number().positive('Amount must be positive'),
});
export type StakeInput = z.infer<typeof StakeSchema>;
