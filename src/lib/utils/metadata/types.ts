import type { Address } from '../common-types';

export interface GitHubSource {
  forge: 'github';
  url: string;
  repoName: string;
  ownerName: string;
}

export type Source = GitHubSource;

export type AccountId = string;

export interface AddressDriverAccount {
  driver: 'address';
  accountId: AccountId;
  address: Address;
}

export interface NFTDriverAccount {
  driver: 'nft';
  accountId: AccountId;
  owner: AddressDriverAccount;
}

export interface RepoDriverAccount {
  driver: 'repo';
  accountId: AccountId;
}

export type Account = AddressDriverAccount | NFTDriverAccount | RepoDriverAccount;

export enum VerificationStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  FAILED = 'FAILED',
  FINISHED = 'FINISHED',
}

export interface UnclaimedGitProject<ST extends Source = Source> {
  verificationStatus: VerificationStatus;
  claimed: false;
  owner: undefined;
  repoDriverAccount: RepoDriverAccount;
  source: ST;
}

export interface DripListSplitReceiver {
  type: 'dripList';
  weight: number;
  account: NFTDriverAccount;
}

export interface AddressDriverSplitReceiver {
  type: 'address';
  weight: number;
  account: AddressDriverAccount;
}

export interface RepoDriverSplitReceiver {
  type: 'repo';
  weight: number;
  account: RepoDriverAccount;
  source: Source;
}

export interface RepoDriverAccountSplits {
  maintainers: AddressDriverSplitReceiver[];
  dependencies: (AddressDriverSplitReceiver | RepoDriverSplitReceiver | DripListSplitReceiver)[];
}

export interface ClaimedGitProject<ST extends Source = Source> {
  claimed: true;
  owner: AddressDriverAccount;
  repoDriverAccount: RepoDriverAccount;
  source: ST;
  color: string;
  emoji: string;
  description?: string;
  splits: RepoDriverAccountSplits;
}

export type GitProject<ST extends Source = Source> =
  | UnclaimedGitProject<ST>
  | ClaimedGitProject<ST>;

export interface DripList {
  account: NFTDriverAccount;
  name: string;
  description: string | undefined;
  projects: (DripListSplitReceiver | AddressDriverSplitReceiver | RepoDriverSplitReceiver)[];
}
