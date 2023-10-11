import type { GitProject, ProjectWhereInput } from './generated/graphql';
import type { ProjectId } from '$lib/utils/project/types';
import * as Appolo from '@apollo/client';

export default class DripsQL {
  private DRIPS_GRAPHQL_URL = 'https://drips-api.ey.r.appspot.com/';

  private readonly _apolloClient: Appolo.ApolloClient<any>;

  constructor(url?: string) {
    this._apolloClient = new ApolloClient({
      uri: url || this.DRIPS_GRAPHQL_URL,
      cache: new InMemoryCache(),
    });
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

    const {
      data: { gitProjectById },
    } = await this._apolloClient.query<{ gitProjectById: GitProject }>({
      query,
      variables: { id },
    });

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

    const {
      data: { gitProjects },
    } = await this._apolloClient.query<{ gitProjects: GitProject[] }>({
      query,
      variables: { where },
    });

    return gitProjects;
  }

  public async query<T>(query: DocumentNode, variables?: OperationVariables): Promise<T> {
    const { data } = await this._apolloClient.query({
      query: query,
      variables,
    });

    return data;
  }
}
