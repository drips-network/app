import z from 'zod';

export const STELLAR_MEMO_TYPES = ['text', 'id', 'hash', 'return'] as const;
export const stellarMemoTypeSchema = z.enum(STELLAR_MEMO_TYPES);
export type StellarMemoType = z.infer<typeof stellarMemoTypeSchema>;

export const grantStatusSchema = z.enum([
  'withdrawable',
  'test_transaction_requested',
  'test_transaction_sent',
  'withdrawal_pending',
  'withdrawal_complete',
]);
export type GrantStatus = z.infer<typeof grantStatusSchema>;

export const grantTransactionStatusSchema = z.enum(['pending', 'complete', 'cancelled']);
export type GrantTransactionStatus = z.infer<typeof grantTransactionStatusSchema>;

export const grantTransactionTypeSchema = z.enum(['test', 'withdrawal']);
export type GrantTransactionType = z.infer<typeof grantTransactionTypeSchema>;

export const grantTransactionDtoSchema = z.object({
  id: z.uuid(),
  grantId: z.uuid(),
  type: grantTransactionTypeSchema,
  status: grantTransactionStatusSchema,
  amountUSD: z.number(),
  stellarAddress: z.string(),
  memoType: stellarMemoTypeSchema.nullable(),
  memoValue: z.string().nullable(),
  transactionHash: z.string().nullable(),
  requestedAt: z.coerce.date(),
  completedAt: z.coerce.date().nullable(),
});
export type GrantTransactionDto = z.infer<typeof grantTransactionDtoSchema>;

export const grantDtoSchema = z.object({
  id: z.uuid(),
  userId: z.uuid(),
  waveProgramId: z.uuid(),
  waveProgramSlug: z.string(),
  waveProgramName: z.string(),
  waveId: z.uuid(),
  waveNumber: z.number().int(),
  type: z.string(),
  description: z.string(),
  initialAmountUSD: z.number(),
  currentAmountUSD: z.number(),
  status: grantStatusSchema,
  expiresAt: z.coerce.date(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type GrantDto = z.infer<typeof grantDtoSchema>;

export const grantDetailDtoSchema = grantDtoSchema.extend({
  transactions: z.array(grantTransactionDtoSchema),
});
export type GrantDetailDto = z.infer<typeof grantDetailDtoSchema>;

export const requestTestTransactionBodySchema = z.object({
  stellarAddress: z.string().min(56).max(56),
  memoType: stellarMemoTypeSchema.optional(),
  memoValue: z.string().optional(),
});
export type RequestTestTransactionBody = z.infer<typeof requestTestTransactionBodySchema>;

export const requestWithdrawalBodySchema = z.object({
  stellarAddress: z.string().min(56).max(56),
  memoType: stellarMemoTypeSchema.optional(),
  memoValue: z.string().optional(),
});
export type RequestWithdrawalBody = z.infer<typeof requestWithdrawalBodySchema>;
