<script lang="ts">
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { ethers } from 'ethers';
  import assert from '$lib/utils/assert';
  import { getRepoDriverClient } from '$lib/utils/get-drips-clients';
  import query from '$lib/graphql/dripsQL';
  import type { Project } from '$lib/graphql/generated/graphql';
  import isClaimed from '$lib/utils/project/is-claimed';
  import { gql } from 'graphql-request';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  onMount(() =>
    dispatch('await', {
      promise: pollSubgraph,
      message: 'Waiting for the verification to finalize…',
      subtitle: 'This might take a few minutes. Please donʼt close this window.',
    }),
  );

  async function pollSubgraph() {
    let start = Date.now();
    let timeout = 5 * 60 * 1000; // Timeout after 5 minutes

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { forge, username, repoName } = GitProjectService.deconstructUrl($context.gitUrl);
      const projectName = `${username}/${repoName}`;

      const repoDriverClient = await getRepoDriverClient();
      const accountId = await repoDriverClient.getAccountId(forge, projectName);

      const owner = await repoDriverClient.getOwner(accountId);

      assert($walletStore.address);
      if (
        owner &&
        ethers.utils.getAddress(owner) === ethers.utils.getAddress($walletStore.address)
      ) {
        return;
      }

      const getProjectByIdQuery = gql`
        query Project($projectId: ID!) {
          project(id: $projectId) {
            ... on ClaimedProject {
              account {
                accountId
                driver
              }
              color
              description
              emoji
              owner {
                accountId
                address
                driver
              }
              source {
                forge
                ownerName
                repoName
                url
              }
              verificationStatus
              splits {
                maintainers {
                  account {
                      accountId
                      address
                    }
                  driver
                  weight
                }
                dependencies {
                  ... on AddressReceiver {
                    account {
                      accountId
                      address
                    }
                    driver
                    weight
                  }
                  ... on ProjectReceiver {
                    driver
                    weight
                    project {
                      ... on ClaimedProject {
                        account {
                          accountId
                          driver
                        }
                        color
                        description
                        emoji
                        owner {
                          accountId
                          address
                          driver
                        }
                        source {
                          forge
                          ownerName
                          repoName
                          url
                        }
                        verificationStatus
                      }
                      ... on UnclaimedProject {
                        account {
                          accountId
                          driver
                        }
                        source {
                          forge
                          ownerName
                          repoName
                          url
                        }
                        verificationStatus
                      }
                    }
                  }
                  ... on DripListReceiver {
                    driver
                    weight
                    dripList {
                      account {
                        accountId
                      }
                      owner {
                        accountId
                        address
                        driver
                      }
                      previousOwnerAddress
                      name
                    }
                  }
                }
              }
            }
            ... on UnclaimedProject {
              account {
                accountId
                driver
              }
              source {
                forge
                ownerName
                repoName
                url
              }
              verificationStatus
            }
          }
        }
      `;

      const response = await query<{ project: Project | null }>(getProjectByIdQuery, {
        projectId: accountId,
      });

      const project = response.project;
      if (project && !isClaimed(project)) {
        if (Date.now() - start >= timeout) {
          throw new Error('Project verification failed after 5 minutes'); // Throw error after timeout
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // Wait for 5 seconds before the next request
    }
  }
</script>
