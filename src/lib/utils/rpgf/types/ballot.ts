import z from 'zod';
import { userSchema } from './user';

export const ballotSchema = z.record(z.string().uuid(), z.number().int().positive());
export type Ballot = z.infer<typeof ballotSchema>;
export type InProgressBallot = Record<string, number | null | string>;

export type SubmitBallotDto = {
  ballot: Ballot;
};

export const wrappedBallotSchema = z.object({
  id: z.string().uuid(),
  user: userSchema,
  ballot: ballotSchema,
  createdAt: z.string().pipe(z.coerce.date()),
});
export type WrappedBallot = z.infer<typeof wrappedBallotSchema>;
