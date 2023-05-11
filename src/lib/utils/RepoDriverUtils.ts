import { Forge } from 'radicle-drips';

export default class RepoDriverUtils {
  public static forgeFromString(forgeAsString: string) {
    let forge: Forge;
    if (forgeAsString === 'github') {
      forge = Forge.GitHub;
    } else if (forgeAsString === 'gitlab') {
      forge = Forge.GitLab;
    } else if (forgeAsString === 'radicle') {
      throw new Error('Radicle forges are not supported yet.');
    } else {
      throw new Error(`Unknown forge type: ${forgeAsString}`);
    }

    return forge;
  }
}
