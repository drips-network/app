import AddressDriverMetadataManager from './AddressDriverMetadataManager';
import GitDriverMetadataManager from './GitDriverMetadataManager';
import NftDriverMetadataManager from './NftDriverMetadataManager';

export default class MetadataManagerFactory {
  public static getAddressDriverMetadataManager(): AddressDriverMetadataManager {
    return new AddressDriverMetadataManager();
  }

  public static getNftDriverMetadataManager(): NftDriverMetadataManager {
    return new NftDriverMetadataManager();
  }

  public static getGitDriverMetadataManager(): GitDriverMetadataManager {
    return new GitDriverMetadataManager();
  }
}
