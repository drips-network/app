import { createVersionedParser } from '../../versioned-parser';
import { addressDriverAccountMetadataSchemaV1 } from './address-driver/v1';
import { nftDriverAccountMetadataSchemaV1 } from './nft-driver/v1';
import { nftDriverAccountMetadataSchemaV2 } from './nft-driver/v2';
import { repoDriverAccountMetadataSchemaV1 } from './repo-driver/v1';
import { repoDriverAccountMetadataSchemaV2 } from './repo-driver/v2';

export const nftDriverAccountMetadataParser = createVersionedParser(
  nftDriverAccountMetadataSchemaV2,
  nftDriverAccountMetadataSchemaV1,
);

export const addressDriverAccountMetadataParser = createVersionedParser(
  addressDriverAccountMetadataSchemaV1,
);

export const repoDriverAccountMetadataParser = createVersionedParser(
  repoDriverAccountMetadataSchemaV2,
  repoDriverAccountMetadataSchemaV1,
);
