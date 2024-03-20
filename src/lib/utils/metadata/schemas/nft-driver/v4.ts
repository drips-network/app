import { z } from 'zod';
import { nftDriverAccountMetadataSchemaV3 } from './v3';

export const nftDriverAccountMetadataSchemaV4 = nftDriverAccountMetadataSchemaV3.extend({
  latestVotingRoundId: z.string().optional(),
});
