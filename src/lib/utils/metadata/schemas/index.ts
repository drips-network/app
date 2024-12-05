import { createVersionedParser } from '@efstajas/versioned-parser';
import { addressDriverAccountMetadataSchemaV1 } from './address-driver/v1';
import { nftDriverAccountMetadataSchemaV1 } from './nft-driver/v1';
import { nftDriverAccountMetadataSchemaV2 } from './nft-driver/v2';
import { nftDriverAccountMetadataSchemaV3 } from './nft-driver/v3';
import { repoDriverAccountMetadataSchemaV1 } from './repo-driver/v1';
import { repoDriverAccountMetadataSchemaV2 } from './repo-driver/v2';
import { repoDriverAccountMetadataSchemaV3 } from './repo-driver/v3';
import { repoDriverAccountMetadataSchemaV4 } from './repo-driver/v4';
import { nftDriverAccountMetadataSchemaV4 } from './nft-driver/v4';
import { nftDriverAccountMetadataSchemaV5 } from '$lib/utils/metadata/schemas/nft-driver/v5';
import { repoDriverAccountMetadataSchemaV5 } from '$lib/utils/metadata/schemas/repo-driver/v5';

export const nftDriverAccountMetadataParser = createVersionedParser([
  nftDriverAccountMetadataSchemaV5.parse,
  nftDriverAccountMetadataSchemaV4.parse,
  nftDriverAccountMetadataSchemaV3.parse,
  nftDriverAccountMetadataSchemaV2.parse,
  nftDriverAccountMetadataSchemaV1.parse,
]);

export const addressDriverAccountMetadataParser = createVersionedParser([
  addressDriverAccountMetadataSchemaV1.parse,
]);

export const repoDriverAccountMetadataParser = createVersionedParser([
  repoDriverAccountMetadataSchemaV5.parse,
  repoDriverAccountMetadataSchemaV4.parse,
  repoDriverAccountMetadataSchemaV3.parse,
  repoDriverAccountMetadataSchemaV2.parse,
  repoDriverAccountMetadataSchemaV1.parse,
]);
