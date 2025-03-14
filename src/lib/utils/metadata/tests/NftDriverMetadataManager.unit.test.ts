import NftDriverMetadataManager from '../NftDriverMetadataManager';
import mapFilterUndefined from '$lib/utils/map-filter-undefined';
import type { LatestVersion } from '@efstajas/versioned-parser';
import type { nftDriverAccountMetadataParser } from '../schemas';
import unreachable from '$lib/utils/unreachable';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/stores/wallet/wallet.store');

describe('NftDriverMetadataManager', () => {
  vi.mock('$lib/utils/get-drips-clients');

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('buildAccountMetadata', () => {
    it('should return the account metadata', () => {
      // Arrange
      const metadataMgr = new NftDriverMetadataManager();

      const context = {
        forAccountId: '1',
        isVisible: false,
        projects: [
          {
            weight: 1,
            accountId: '1',
            source: {
              forge: 'github',
              repoName: 'repo',
              url: 'repo.com',
            },
          },
        ] as LatestVersion<typeof nftDriverAccountMetadataParser>['projects'],
      };

      // Act
      const metadata = metadataMgr.buildAccountMetadata(context);

      // Assert
      expect(metadata).toEqual({
        driver: 'nft',
        name: undefined,
        describes: {
          driver: 'nft',
          accountId: '1',
        },
        isDripList: true,
        isVisible: false,
        projects: mapFilterUndefined(context.projects, (listProj) => ({
          accountId: '1',
          weight: listProj.weight,
          source: 'source' in listProj ? listProj.source : unreachable(),
        })),
      });
    });
  });
});
