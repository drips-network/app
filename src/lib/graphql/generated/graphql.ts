export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export enum AddressDriver {
  AddressDriver = 'AddressDriver',
}

export type DripList = {
  __typename?: 'DripList';
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  ownerAddress: Scalars['String']['output'];
  previousOwnerAddress: Scalars['String']['output'];
  splits?: Maybe<DripListSplits>;
};

export type DripListAddressDriverSplitReceiver = {
  __typename?: 'DripListAddressDriverSplitReceiver';
  driver: AddressDriver;
  fundeeAccountId: Scalars['String']['output'];
  funderDripListId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: DripListSplitReceiver;
  weight: Scalars['Int']['output'];
};

export type DripListNftDriverSplitReceiver = {
  __typename?: 'DripListNftDriverSplitReceiver';
  driver: NftDriver;
  fundeeDripList?: Maybe<DripList>;
  funderDripListId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: DripListSplitReceiver;
  weight: Scalars['Int']['output'];
};

export type DripListRepoDriverSplitReceiver = {
  __typename?: 'DripListRepoDriverSplitReceiver';
  driver: RepoDriver;
  fundeeProject?: Maybe<GitProject>;
  funderDripListId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: DripListSplitReceiver;
  weight: Scalars['Int']['output'];
};

export enum DripListSplitReceiver {
  DripListDependency = 'DripListDependency',
}

export type DripListSplits = {
  __typename?: 'DripListSplits';
  ofTypeAddress?: Maybe<Array<DripListAddressDriverSplitReceiver>>;
  ofTypeDripList?: Maybe<Array<DripListNftDriverSplitReceiver>>;
  ofTypeProject?: Maybe<Array<DripListRepoDriverSplitReceiver>>;
};

export type DripListWhereInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  ownerAddress?: InputMaybe<Scalars['String']['input']>;
};

export enum Forge {
  GitHub = 'GitHub',
  GitLab = 'GitLab',
}

export type GitProject = {
  __typename?: 'GitProject';
  color: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  emoji: Scalars['String']['output'];
  forge: Forge;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  ownerAccountId: Scalars['String']['output'];
  ownerAddress: Scalars['String']['output'];
  ownerName: Scalars['String']['output'];
  repoName: Scalars['String']['output'];
  splits: GitProjectSplits;
  url: Scalars['String']['output'];
  verificationStatus: ProjectVerificationStatus;
};

export type GitProjectAddressDriverSplitReceiver = {
  __typename?: 'GitProjectAddressDriverSplitReceiver';
  driver: AddressDriver;
  fundeeAccountId: Scalars['String']['output'];
  funderProjectId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: GitProjectSplitReceiverType;
  weight: Scalars['Int']['output'];
};

export type GitProjectDependenciesSplits = {
  __typename?: 'GitProjectDependenciesSplits';
  ofTypeAddress?: Maybe<Array<GitProjectAddressDriverSplitReceiver>>;
  ofTypeProject?: Maybe<Array<GitProjectRepoDriverSplitReceiver>>;
};

export type GitProjectRepoDriverSplitReceiver = {
  __typename?: 'GitProjectRepoDriverSplitReceiver';
  driver: RepoDriver;
  fundeeProject?: Maybe<GitProject>;
  funderProjectId: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  type: GitProjectSplitReceiverType;
  weight: Scalars['Int']['output'];
};

export enum GitProjectSplitReceiverType {
  ProjectDependency = 'ProjectDependency',
  ProjectMaintainer = 'ProjectMaintainer',
}

export type GitProjectSplits = {
  __typename?: 'GitProjectSplits';
  dependencies?: Maybe<GitProjectDependenciesSplits>;
  maintainers?: Maybe<Array<GitProjectAddressDriverSplitReceiver>>;
};

export enum NftDriver {
  NftDriver = 'NftDriver',
}

export enum ProjectVerificationStatus {
  Claimed = 'Claimed',
  PendingMetadata = 'PendingMetadata',
  PendingOwner = 'PendingOwner',
  Started = 'Started',
  Unclaimed = 'Unclaimed',
}

export type ProjectWhereInput = {
  id?: InputMaybe<Scalars['String']['input']>;
  ownerAddress?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  verificationStatus?: InputMaybe<ProjectVerificationStatus>;
};

export type Query = {
  __typename?: 'Query';
  dripList?: Maybe<DripList>;
  dripLists?: Maybe<Array<DripList>>;
  gitProjectById?: Maybe<GitProject>;
  gitProjects?: Maybe<Array<GitProject>>;
};

export type QueryDripListArgs = {
  id: Scalars['ID']['input'];
};

export type QueryDripListsArgs = {
  where?: InputMaybe<DripListWhereInput>;
};

export type QueryGitProjectByIdArgs = {
  id: Scalars['ID']['input'];
};

export type QueryGitProjectsArgs = {
  where?: InputMaybe<ProjectWhereInput>;
};

export enum RepoDriver {
  RepoDriver = 'RepoDriver',
}
