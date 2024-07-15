import RepoDriverMetadataManager from './RepoDriverMetadataManager';
import NftDriverMetadataManager from './NftDriverMetadataManager';

export default class MetadataManagerFactory {
  public static getNftDriverMetadataManager(): NftDriverMetadataManager {
    return new NftDriverMetadataManager();
  }

  public static getRepoDriverMetadataManager(): RepoDriverMetadataManager {
    return new RepoDriverMetadataManager();
  }
}
