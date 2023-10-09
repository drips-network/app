import type DripsQL from '$lib/graphql/DripsQL';
import { ProjectVerificationStatus } from '$lib/graphql/generated/graphql';
import type { Address } from '../common-types';
import { getDripsGraphQlClient } from '../get-drips-clients';
import type { ClaimedGitProject } from './types';

export class ProjectService {
  private readonly _dripsQL: DripsQL;

  private constructor(dripsQL: DripsQL) {
    this._dripsQL = dripsQL;
  }

  public static new(dripsQL?: DripsQL): ProjectService {
    dripsQL = dripsQL ?? getDripsGraphQlClient();

    return new ProjectService(dripsQL);
  }

  public async getProjectsByOwner(ownerAddress: Address): Promise<ClaimedGitProject[]> {
    return await this._dripsQL.getProjects({
      ownerAddress,
      verificationStatus: ProjectVerificationStatus.Claimed,
    });
  }
}
