// TODO: Temporary types until centralized types for projects are added.

export interface GitHubSource {
  type: 'github';
  repoName: string;
  ownerName: string;
  url: string;
}

export interface GitLabSource {
  type: 'gitlab';
  repoName: string;
  ownerName: string;
  host: string;
  url: string;
}

export interface RadicleSource {
  type: 'radicle';
  rid: string;
  repoName: string;
  seed: string;
  url: string;
}

export interface GenericGitSource {
  type: 'generic';
  repoName: string;
  url: string;
}

type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

type Address = string;
type UserId = string;

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

export interface UnclaimedGitProject<S extends Source = Source> {
  gitDriverAccount: GitDriverAccount;
  owner: undefined;
  source: S;
}

export interface ClaimedGitProject<S extends Source = Source> {
  gitDriverAccount: GitDriverAccount;
  owner: AddressDriverAccount;
  source: S;
  emoji: string;
  color: string;
  description?: string;
}

export type GitProject<S extends Source = Source> = UnclaimedGitProject<S> | ClaimedGitProject<S>;
