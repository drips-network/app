import { z } from 'zod';
import { addressDriverAccountMetadataSchemaV1 } from './v1';

export const addressDriverAccountMetadataSchemaV2 = addressDriverAccountMetadataSchemaV1.extend({
  /**
   * Drip Lists are NFTs, meaning that they can be transferred to any address without the receiving party's consent.
   * The app only displays Drip Lists that are included in this array on their profile, so that users are always
   * in control of what appears on their profiles.
   *
   * If undefined or missing, only Drip Lists created by the user themselves should be displayed.
   */
  visibleDripListAccountIds: z.array(z.string()).optional(),
});
