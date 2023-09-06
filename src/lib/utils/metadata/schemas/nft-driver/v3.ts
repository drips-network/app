import { z } from 'zod';
import { nftDriverAccountMetadataSchemaV2 } from './v2';

export const nftDriverAccountMetadataSchemaV3 = nftDriverAccountMetadataSchemaV2.extend({
  description: z.string().optional(),
});
