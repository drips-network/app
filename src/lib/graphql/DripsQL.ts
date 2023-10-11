import type { GitProject, ProjectWhereInput } from './generated/graphql';
import type { ProjectId } from '$lib/utils/project/types';
import { GraphQLClient, gql, type Variables, type RequestDocument } from 'graphql-request';

export default class DripsQL {
  private DRIPS_GRAPHQL_URL = 'https://drips-api.ey.r.appspot.com/';

  private readonly _graphQlClient: GraphQLClient;

  constructor(url?: string) {
    this._graphQlClient = new GraphQLClient(url ?? this.DRIPS_GRAPHQL_URL);
  }

  public async getProjectById(id: ProjectId): Promise<GitProject> {
    const query = gql`
      query GitProjectById($id: ID!) {
        gitProjectById(id: $id) {
          color
          description
          emoji
          forge
          id
          name
          ownerAddress
          ownerName
          ownerAccountId
          repoName
          url
          verificationStatus
          splits {
            maintainers {
              id
              fundeeAccountId
              funderProjectId
              driver
              type
              weight
            }
            dependencies {
              ofTypeAddress {
                driver
                fundeeAccountId
                funderProjectId
                id
                type
                weight
              }
              ofTypeProject {
                driver
                fundeeProject {
                  color
                  description
                  emoji
                  forge
                  id
                  name
                  ownerAddress
                  ownerName
                  repoName
                  url
                  verificationStatus
                }
                funderProjectId
                id
                type
                weight
              }
            }
          }
        }
      }
    `;

    const { gitProjectById } = await this.query<{ gitProjectById: GitProject }>(query, { id });

    return gitProjectById;
  }

  public async getProjects(where: ProjectWhereInput): Promise<GitProject[]> {
    const query = gql`
      query GitProjects($where: ProjectWhereInput) {
        gitProjects(where: $where) {
          color
          description
          emoji
          forge
          id
          name
          ownerAddress
          ownerName
          ownerAccountId
          repoName
          url
          verificationStatus
          splits {
            maintainers {
              id
              fundeeAccountId
              funderProjectId
              driver
              type
              weight
            }
            dependencies {
              ofTypeAddress {
                driver
                fundeeAccountId
                funderProjectId
                id
                type
                weight
              }
              ofTypeProject {
                driver
                fundeeProject {
                  color
                  description
                  emoji
                  forge
                  id
                  name
                  ownerAddress
                  ownerName
                  repoName
                  url
                  verificationStatus
                }
                funderProjectId
                id
                type
                weight
              }
            }
          }
        }
      }
    `;

    const { gitProjects } = await this.query<{ gitProjects: GitProject[] }>(query, { where });

    return gitProjects;
  }

  public async query<T>(query: RequestDocument, variables?: Variables): Promise<T> {
    return await this._graphQlClient.request<T>(query, variables);
  }
}
