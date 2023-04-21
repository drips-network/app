import AddressDriverMetadataManager from './AddressDriverMetadataManager';
import GitDriverMetadataManager from './GitDriverMetadataManager';
import NftDriverMetadataManager from './MetadataManagerFactory';

export default class MetadataManagerFactory {
  static getAddressDriverMetadataManager(): AddressDriverMetadataManager {
    return new AddressDriverMetadataManager();
  }

  static getNftDriverMetadataManager(): NftDriverMetadataManager {
    return new NftDriverMetadataManager();
  }

  static getGitDriverMetadataManager(): GitDriverMetadataManager {
    return new GitDriverMetadataManager();
  }
}
