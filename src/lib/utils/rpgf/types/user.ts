import z from 'zod';

export const ethereumAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address')
  .transform((address) => address.toLowerCase());

export const userSchema = z.object({
  id: z.string().uuid(),
  walletAddress: ethereumAddressSchema,
});
export type RpgfUser = z.infer<typeof userSchema>;
