import { versionedMetadata } from '../versioned-metadata';
import { addressDriverAccountMetadataSchemaV1 } from './address-driver/v1';
import { nftDriverAccountMetadataSchemaV1 } from './nft-driver/v1';
import { nftDriverAccountMetadataSchemaV2 } from './nft-driver/v2';
import { repoDriverAccountMetadataSchemaV1 } from './repo-driver/v1';
import { repoDriverAccountMetadataSchemaV2 } from './repo-driver/v2';

export const nftDriverAccountMetadataParser = versionedMetadata(
  nftDriverAccountMetadataSchemaV2,
  nftDriverAccountMetadataSchemaV1,
);

export const addressDriverAccountMetadataParser = versionedMetadata(
  addressDriverAccountMetadataSchemaV1,
);

export const repoDriverAccountMetadataParser = versionedMetadata(
  repoDriverAccountMetadataSchemaV2,
  repoDriverAccountMetadataSchemaV1,
);
