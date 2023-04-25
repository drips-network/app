export interface GitHubSource {
  url: string;
  repoName: string;
  ownerName: string;
}

export interface GitLabSource {
  host: string;
  url: string;
  repoName: string;
  ownerName: string;
}

export interface RadicleSource {
  rid: string;
  url: string;
  seed: string;
  repoName: string;
}

export interface GenericGitSource {
  url: string;
  repoName: string;
}

type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

export type Address = string;
export type UserId = string;

export interface AddressDriverAccount {
  driver: 'address';
  userId: UserId;
  address: Address;
}

export interface NFTDriverAccount {
  driver: 'nft';
  userId: UserId;
  owner: Address;
}

export interface GitDriverAccount {
  driver: 'git';
  userId: UserId;
}

export type Account = AddressDriverAccount | NFTDriverAccount | GitDriverAccount;

export interface UnclaimedGitProject {
  owner: undefined;
  gitDriverAccount: GitDriverAccount;
  source: Source;
}

export interface ClaimedGitProject {
  owner: AddressDriverAccount;
  gitDriverAccount: GitDriverAccount;
  source: Source;
  color: string;
  emoji: string;
  description?: string;
}

export type GitProject = UnclaimedGitProject | ClaimedGitProject;

export interface DripList {
  account: NFTDriverAccount;
  projects: {
    weight: number;
    project: GitProject;
  }[];
  // Properties below are post-MVP
  isPublic: false;
  name: undefined;
  description: undefined;
}
