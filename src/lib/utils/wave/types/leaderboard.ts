import z from 'zod';
import { filterSchema } from './filter';
import { waveUserDtoSchema } from './user';

export const leaderboardFiltersSchema = filterSchema(
  z.object({
    waveId: z.uuid().optional(),
    waveProgramId: z.uuid(),
  }),
);
export type LeaderboardFilters = z.infer<typeof leaderboardFiltersSchema>;

export const leaderboardEntryDtoSchema = z.object({
  user: waveUserDtoSchema,
  totalPoints: z.number().int(),
});
export type LeaderboardEntryDto = z.infer<typeof leaderboardEntryDtoSchema>;
