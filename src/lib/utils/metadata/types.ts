import type { Address } from '../common-types';

export interface GitHubSource {
  forge: 'github';
  url: string;
  repoName: string;
  ownerName: string;
}

export interface GitLabSource {
  forge: 'gitlab';
  host: string;
  url: string;
  repoName: string;
  ownerName: string;
}

export interface RadicleSource {
  forge: 'radicle';
  rid: string;
  url: string;
  seed: string;
  repoName: string;
}

export interface GenericGitSource {
  forge: 'generic';
  url: string;
  repoName: string;
}

export type Source = GitHubSource | GitLabSource | RadicleSource | GenericGitSource;

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

export interface RepoDriverAccount {
  driver: 'repo';
  userId: UserId;
}

export type Account = AddressDriverAccount | NFTDriverAccount | RepoDriverAccount;

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
}

export interface UnclaimedGitProject<ST extends Source = Source> {
  verificationStatus: VerificationStatus;
  claimed: false;
  owner: undefined;
  repoDriverAccount: RepoDriverAccount;
  source: ST;
}

export interface ClaimedGitProject<ST extends Source = Source> {
  claimed: true;
  owner: AddressDriverAccount;
  repoDriverAccount: RepoDriverAccount;
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
