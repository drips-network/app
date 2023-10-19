import {
  ProjectVerificationStatus,
  type ClaimedProject,
  type Project,
} from '$lib/graphql/generated/graphql';

export default function isClaimed(project: Project): project is ClaimedProject {
  if (project.verificationStatus === ProjectVerificationStatus.Claimed) {
    return true;
  }

  return false;
}
