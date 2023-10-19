<script lang="ts">
  import PrimaryColorThemer from '../primary-color-themer/primary-color-themer.svelte';
  import ProjectCard from '../project-card/project-card.svelte';
  import assert from '$lib/utils/assert';
  import Plus from 'radicle-design-system/icons/Plus.svelte';
  import Box from 'radicle-design-system/icons/Box.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import { goto } from '$app/navigation';
  import Section from '../section/section.svelte';
  import query from '$lib/graphql/dripsQL';
  import type { ClaimedProject, ProjectWhereInput } from '$lib/graphql/generated/graphql';
  import { gql } from 'graphql-request';

  export let address: string | undefined;

  let projects: ClaimedProject[] | undefined;
  let error = false;
  let loaded = false;

  export let collapsed = false;
  export let collapsable = false;

  async function updateProjects() {
    try {
      assert(address);

      const getProjectsQuery = gql`
        query Projects($where: ProjectWhereInput) {
          projects(where: $where) {
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
                  accountId
                  address
                  driver
                  type
                  weight
                }
                dependencies {
                  ... on AddressReceiver {
                    accountId
                    address
                    driver
                    type
                    weight
                  }
                  ... on ProjectReceiver {
                    driver
                    type
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
                    weight
                    type
                    driver
                    dripList {
                      id
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

      const response = await query<{ projects: ClaimedProject[] }, { where: ProjectWhereInput }>(
        getProjectsQuery,
        {
          where: {
            ownerAddress: address,
          },
        },
      );
      projects = response.projects;

      loaded = true;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      loaded = true;
      error = true;
    }
  }

  $: address && updateProjects();

  $: isSelf = address && address.toLowerCase() === $walletStore.address?.toLowerCase();
</script>

<Section
  bind:collapsed
  bind:collapsable
  header={{
    icon: Box,
    label: 'Projects',
    actions: isSelf
      ? [
          {
            // TODO: (FIX) clicking this button after completing the claim project flow freezes the UI (in all browsers). It shouldnʼt. 😊
            handler: () => goto(`/app/claim-project`),
            label: 'Claim project',
            icon: Plus,
            variant: 'primary',
          },
        ]
      : [],
  }}
  skeleton={{
    horizontalScroll: false,
    loaded,
    empty: projects?.length === 0,
    error,
    emptyStateEmoji: '🫙',
    emptyStateHeadline: 'No claimed projects',
    emptyStateText: isSelf
      ? 'If you develop an open-source project, click "Claim project" to get started.'
      : 'This user hasnʼt claimed any software projects yet.',
  }}
>
  {#if projects}
    <div class="projects">
      {#each projects as project}
        <div>
          <PrimaryColorThemer colorHex={project.color}><ProjectCard {project} /></PrimaryColorThemer
          >
        </div>
      {/each}
    </div>
  {/if}
</Section>

<style>
  .projects {
    display: flex;
    gap: 1rem;
    max-width: 100%;
    position: relative;
    padding: 2px;
    flex-wrap: wrap;
  }

  .projects > * {
    flex: 1;
    min-width: 16rem;
    max-width: calc(25% - 0.75rem);
  }

  @media (max-width: 560px) {
    .projects > * {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
