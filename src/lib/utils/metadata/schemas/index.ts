import { createVersionedParser } from '@efstajas/versioned-parser';
import { addressDriverAccountMetadataSchemaV1 } from './address-driver/v1';
import { nftDriverAccountMetadataSchemaV1 } from './nft-driver/v1';
import { nftDriverAccountMetadataSchemaV2 } from './nft-driver/v2';
import { nftDriverAccountMetadataSchemaV3 } from './nft-driver/v3';
import { repoDriverAccountMetadataSchemaV1 } from './repo-driver/v1';
import { repoDriverAccountMetadataSchemaV2 } from './repo-driver/v2';

export const nftDriverAccountMetadataParser = createVersionedParser([
  nftDriverAccountMetadataSchemaV3.parse,
  nftDriverAccountMetadataSchemaV2.parse,
  nftDriverAccountMetadataSchemaV1.parse,
]);

export const addressDriverAccountMetadataParser = createVersionedParser([
  addressDriverAccountMetadataSchemaV1.parse,
]);

export const repoDriverAccountMetadataParser = createVersionedParser([
  repoDriverAccountMetadataSchemaV2.parse,
  repoDriverAccountMetadataSchemaV1.parse,
]);
