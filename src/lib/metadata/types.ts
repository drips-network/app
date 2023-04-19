export interface GitHubSource {
  repoName: string;
  ownerName: string;
  url: string;
}

export interface GitLabSource {
  repoName: string;
  ownerName: string;
  host: string;
  url: string;
}

export interface RadicleSource {
  rid: string;
  repoName: string;
  seed: string;
  url: string;
}

export interface GenericGitSource {
  repoName: string;
  url: string;
}

type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

export type Address = string;
export type UserId = string;

export interface AddressDriverAccount {
  driver: 'address';
  userId: UserId;
  address: Address;
}

export interface GitDriverAccount {
  userId: UserId;
  driver: 'git';
}

export interface NFTDriverAccount {
  userId: UserId;
  driver: 'nft';
  owner: Address;
}

export type Account = AddressDriverAccount | GitDriverAccount;

export interface UnclaimedGitProject {
  gitDriverAccount: GitDriverAccount;
  owner: undefined;
  source: Source;
}

export interface ClaimedGitProject {
  gitDriverAccount: GitDriverAccount;
  owner: AddressDriverAccount;
  source: Source;
  emoji: string;
  color: string;
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
