import type DripsQL from '$lib/graphql/DripsQL';
import { Forge as ApiForge, ProjectVerificationStatus } from '$lib/graphql/generated/graphql';
import type { Address } from '../common-types';
import { getDripsGraphQlClient, getRepoDriverClient } from '../get-drips-clients';
import singleOrDefault from '../linq';
import { isValidGitUrl } from '../is-valid-git-url';
import { Forge as ContractForge, type RepoDriverClient } from 'radicle-drips';
import { getRepoByUrl as getGithubRepoByUrl } from '../github/github';
import { toContractForge } from './git-project-utils';
import type { ClaimedGitProject, GitProject, ProjectId, UnclaimedGitProject } from './types';

export class GitProjectService {
  private readonly _dripsQL: DripsQL;
  private readonly _repoDriverClient: RepoDriverClient;

  private constructor(dripsQL: DripsQL, repoDriverClient: RepoDriverClient) {
    this._dripsQL = dripsQL;
    this._repoDriverClient = repoDriverClient;
  }

  public static async new(
    dripsQL?: DripsQL,
    repoDriverClient?: RepoDriverClient,
  ): Promise<GitProjectService> {
    dripsQL = dripsQL ?? getDripsGraphQlClient();
    repoDriverClient = repoDriverClient ?? (await getRepoDriverClient());

    return new GitProjectService(dripsQL, repoDriverClient);
  }

  public static deconstructUrl(url: string): {
    forge: ContractForge;
    username: string;
    repoName: string;
  } {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // If URL ends with /, remove it
    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const parsedURL = new URL(url);

    // TODO: support more forges.
    let forge: ApiForge;
    switch (parsedURL.hostname.toLowerCase()) {
      case 'github.com':
        forge = ApiForge.GitHub;
        break;
      default:
        throw new Error(`Unsupported hostname: ${parsedURL.hostname}`);
    }

    const name = parsedURL.pathname.startsWith('/')
      ? parsedURL.pathname.slice(1)
      : parsedURL.pathname;
    const [username, repoName] = name.split('/');

    return { forge: toContractForge(forge), username, repoName };
  }

  public async getProjectsByOwner(ownerAddress: Address): Promise<ClaimedGitProject[]> {
    return await this._dripsQL.getProjects({
      ownerAddress,
      verificationStatus: ProjectVerificationStatus.Claimed,
    });
  }

  public async getProjectByUrl(url: string): Promise<GitProject> {
    if (!isValidGitUrl(url)) {
      throw new Error(`Invalid git URL: ${url}`);
    }

    const projects = await this._dripsQL.getProjects({ url });
    const project = singleOrDefault(projects);

    const { forge, username, repoName } = GitProjectService.deconstructUrl(url);
    const projectName = `${username}/${repoName}`;

    const id = await this._repoDriverClient.getAccountId(forge, projectName);

    if (!project) {
      const unclaimedProject: UnclaimedGitProject = {
        id,
        url,
        forge,
        repoName,
        name: projectName,
        ownerName: username,
        verificationStatus: ProjectVerificationStatus.Unclaimed,
      };

      return unclaimedProject;
    }

    return project;
  }

  public async getProjectById(id: ProjectId): Promise<GitProject> {
    return await this._dripsQL.getProjectById(id);
  }

  public async getProjectInfo(url: string): Promise<{
    description: string | null;
    defaultBranch: string | null;
    starsCount: number;
    forksCount: number;
  }> {
    const { forge } = GitProjectService.deconstructUrl(url);

    if (forge === ContractForge.GitHub) {
      const {
        description,
        forks_count: forksCount,
        stargazers_count: starsCount,
        default_branch: defaultBranch,
      } = await getGithubRepoByUrl(url);

      return {
        forksCount,
        starsCount,
        description,
        defaultBranch,
      };
    } else {
      throw new Error(`Cannot get project info: unsupported forge: ${forge}`);
    }
  }
}
