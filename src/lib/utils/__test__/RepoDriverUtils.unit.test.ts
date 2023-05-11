import { Forge } from 'radicle-drips';
import RepoDriverUtils from '../RepoDriverUtils';

vi.mock('$env/dynamic/public', () => ({
  env: {},
}));

vi.mock('$lib/utils/get-drips-clients');

describe('RepoDriverUtils', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('forgeFromString', () => {
    it('should return the expected forge', () => {
      // Act
      const ghForge = RepoDriverUtils.forgeFromString('github');
      const glForge = RepoDriverUtils.forgeFromString('gitlab');

      // Assert
      expect(ghForge).toBe(Forge.GitHub);
      expect(glForge).toBe(Forge.GitLab);
    });

    it('should throw an error if the forge is not supported', () => {
      // Act
      const forge = () => RepoDriverUtils.forgeFromString('not-supported');

      // Assert
      expect(forge).toThrow();
    });
  });
});
