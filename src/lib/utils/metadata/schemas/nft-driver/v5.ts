import { z } from 'zod';
import { nftDriverAccountMetadataSchemaV4 } from '$lib/utils/metadata/schemas/nft-driver/v4';

export const nftDriverAccountMetadataSchemaV5 = nftDriverAccountMetadataSchemaV4.extend({
  isVisible: z.boolean(),
});
