import { z } from 'zod';
import { repoDriverAccountMetadataSchemaV4 } from './v4';

export const repoDriverAccountMetadataSchemaV5 = repoDriverAccountMetadataSchemaV4.extend({
  isVisible: z.boolean(),
});
