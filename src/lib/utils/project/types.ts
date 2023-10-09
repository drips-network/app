import type {
  Forge,
  GitProject as ApiGitProject,
  ProjectVerificationStatus,
} from '$lib/graphql/generated/graphql';

export type ProjectId = string;
export type RepoAccountStatus = 'not-started' | 'claimed' | 'owner-update-requested';

export type ClaimedGitProject = ApiGitProject;

export type UnclaimedGitProject = {
  id: string;
  url: string;
  name: string;
  forge: Forge;
  repoName: string;
  ownerName: string;
  verificationStatus: ProjectVerificationStatus.Unclaimed;
};

export type GitProject = ClaimedGitProject | UnclaimedGitProject;
