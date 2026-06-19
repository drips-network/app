import z from 'zod';
import { authenticatedCall } from './call';
import parseRes from './utils/parse-res';
import {
  paginatedResponseSchema,
  type PaginationInput,
  toPaginationParams,
} from './types/pagination';

export const restrictionTypeSchema = z.enum(['ban', 'restriction']);
export type RestrictionType = z.infer<typeof restrictionTypeSchema>;

export const bannedUserSchema = z.object({
  id: z.uuid(),
  gitHubUserId: z.number().int(),
  gitHubUsername: z.string().nullable(),
  type: restrictionTypeSchema,
  reason: z.string().nullable(),
  bannedAt: z.coerce.date(),
  bannedBy: z
    .object({
      id: z.uuid(),
      gitHubUsername: z.string(),
    })
    .nullable(),
});
export type BannedUser = z.infer<typeof bannedUserSchema>;

export const discordBanResultSchema = z.enum(['banned', 'no_linked_account', 'failed']);
export type DiscordBanResult = z.infer<typeof discordBanResultSchema>;

export const banGitHubUserResponseSchema = z.object({
  success: z.boolean(),
  revokedTokenCount: z.number().int().nonnegative(),
  discordBanResult: discordBanResultSchema.nullable().optional(),
});
export type BanGitHubUserResponse = z.infer<typeof banGitHubUserResponseSchema>;

export const banTargetDiscordAccountResponseSchema = z.object({
  discordAccount: z
    .object({
      providerUsername: z.string(),
      providerDisplayName: z.string().nullable(),
      providerAvatarUrl: z.string().nullable(),
    })
    .nullable(),
});
export type BanTargetDiscordAccount = z.infer<
  typeof banTargetDiscordAccountResponseSchema
>['discordAccount'];

export async function listBans(
  f = fetch,
  options: { pagination?: PaginationInput; type?: RestrictionType } = {},
) {
  const params = new URLSearchParams(toPaginationParams(options.pagination));
  if (options.type) {
    params.append('type', options.type);
  }

  const queryString = params.toString();
  const path = `/api/admin/bans${queryString ? `?${queryString}` : ''}`;

  const res = await authenticatedCall(f, path);
  return parseRes(paginatedResponseSchema(bannedUserSchema), res);
}

export async function banGitHubUser(
  f = fetch,
  data: {
    gitHubUserId: number;
    type: RestrictionType;
    reason?: string;
    skipNotification?: boolean;
    banFromDiscord?: boolean;
  },
) {
  const res = await authenticatedCall(f, '/api/admin/bans', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return parseRes(banGitHubUserResponseSchema, res);
}

export async function getBanTargetDiscordAccount(f = fetch, gitHubUserId: number) {
  const res = await authenticatedCall(f, `/api/admin/bans/discord-account/${gitHubUserId}`);
  return parseRes(banTargetDiscordAccountResponseSchema, res);
}

export async function unbanGitHubUser(f = fetch, gitHubUserId: number) {
  const res = await authenticatedCall(f, `/api/admin/bans/${gitHubUserId}`, {
    method: 'DELETE',
  });

  if (res.status === 404) {
    throw new Error('That user is not currently banned or restricted.');
  }
}
