import z from 'zod';
import { filterSchema } from './filter';
import { waveUserDtoSchema } from './user';

export const leaderboardFiltersSchema = filterSchema(
  z.object({
    cycleId: z.uuid().optional(),
    waveId: z.uuid().optional(),
  }),
);
export type LeaderboardFilters = z.infer<typeof leaderboardFiltersSchema>;

export const leaderboardEntryDtoSchema = z.object({
  user: waveUserDtoSchema,
  totalPoints: z.number().int(),
});
export type LeaderboardEntryDto = z.infer<typeof leaderboardEntryDtoSchema>;
