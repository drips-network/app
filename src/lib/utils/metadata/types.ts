export interface GitHubSource {
  type: 'github';
  url: string;
  repoName: string;
  ownerName: string;
}

export interface GitLabSource {
  type: 'gitlab';
  host: string;
  url: string;
  repoName: string;
  ownerName: string;
}

export interface RadicleSource {
  type: 'radicle';
  rid: string;
  url: string;
  seed: string;
  repoName: string;
}

export interface GenericGitSource {
  type: 'generic';
  url: string;
  repoName: string;
}

export type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

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

export interface UnclaimedGitProject<ST extends Source = Source> {
  claimed: false;
  owner: undefined;
  gitDriverAccount: GitDriverAccount;
  source: ST;
}

export interface ClaimedGitProject<ST extends Source = Source> {
  claimed: true;
  owner: AddressDriverAccount;
  gitDriverAccount: GitDriverAccount;
  source: ST;
  color: string;
  emoji: string;
  description?: string;
}

export type GitProject<ST extends Source = Source> =
  | UnclaimedGitProject<ST>
  | ClaimedGitProject<ST>;

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
