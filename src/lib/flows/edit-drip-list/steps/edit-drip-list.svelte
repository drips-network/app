<script lang="ts">
  import type { Splits, Split } from '$lib/components/splits/splits.svelte';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import IdentityBadge from '$lib/components/identity-badge/identity-badge.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import {
    getAddressDriverClient,
    getNFTDriverClient,
    getRepoDriverClient,
  } from '$lib/utils/get-drips-clients';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import type { GitProject } from '$lib/utils/metadata/types';
  import modal from '$lib/stores/modal';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let dripListId: string;
  export let representationalSplits: Splits;
  export let projectToAdd: GitProject | undefined = undefined;

  // TODO: Ensure these values are saved in case there's some TX error.

  function flattenRepresentationalSplits(list: Splits): Split[] {
    return list.reduce<Split[]>((acc, i) => {
      if (i.type === 'split-group') {
        return [...acc, ...flattenRepresentationalSplits(i.list)];
      }
      return [...acc, i];
    }, []);
  }

  let items = Object.fromEntries(
    mapFilterUndefined(flattenRepresentationalSplits(representationalSplits), (rs) => {
      if (rs.type === 'project-split') {
        return [
          rs.project.source.url,
          {
            type: 'selectable',
            label: {
              component: ProjectBadge,
              props: {
                project: rs.project,
              },
            },
            editablePercentage: true,
          },
        ];
      } else if (rs.type === 'address-split') {
        return [
          rs.address,
          {
            type: 'selectable',
            label: {
              component: IdentityBadge,
              props: {
                address: rs.address,
                size: 'medium',
              },
            },
            editablePercentage: true,
          },
        ];
      } else {
        return undefined;
      }
    }),
  );

  const MAX_SPLITS_WEIGHT = 1000000;

  function getSplitPercent(weight: number) {
    return ((weight * MAX_SPLITS_WEIGHT) / MAX_SPLITS_WEIGHT / MAX_SPLITS_WEIGHT) * 100;
  }

  let percentages = Object.fromEntries(
    mapFilterUndefined(flattenRepresentationalSplits(representationalSplits), (rs) => {
      if (rs.type === 'project-split') {
        return [rs.project.source.url, getSplitPercent(rs.weight)];
      } else if (rs.type === 'address-split') {
        return [rs.address, getSplitPercent(rs.weight)];
      } else {
        return undefined;
      }
    }),
  );

  let selected = Object.keys(percentages);

  if (projectToAdd) {
    items[projectToAdd.source.url] = {
      type: 'selectable',
      label: {
        component: ProjectBadge,
        props: {
          project: projectToAdd,
        },
      },
      editablePercentage: true,
    };

    selected.push(projectToAdd.source.url);
  }

  let listValid = false;

  // TODO: Auto-refresh UI when splits change
  function submit() {
    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const nftDriverClient = await getNFTDriverClient();
          const addressDriverClient = await getAddressDriverClient();
          const repoDriverClient = await getRepoDriverClient();

          const userIds = await Promise.all(
            selected.map(async (s) => {
              if (s.startsWith('0x')) {
                return await addressDriverClient.getUserIdByAddress(s);
              } else {
                const { forge, repoName, username } = GitProjectService.deconstructUrl(s);
                const projectName = `${username}/${repoName}`;

                return await repoDriverClient.getUserId(forge, projectName);
              }
            }),
          );

          const tx = nftDriverClient.setSplits(
            dripListId,
            mapFilterUndefined(selected, (slug, index) => {
              const userId = userIds[index];

              const percentage = percentages[slug];
              // If percentage is zero, omit split
              if (!percentage) return undefined;

              return {
                userId,
                weight: Math.floor((percentage / 100) * 1000000),
              };
            }),
          );

          return { tx };
        },

        transactions: (transactContext) => ({
          transaction: () => transactContext.tx,
        }),
      }),
    );
  }
</script>

<StepLayout>
  <StepHeader
    emoji="✏️"
    headline="Edit your Drip List"
    description="Choose which GitHub projects and Ethereum addresses you'd like to support with this Drip List."
  />
  <ListEditor bind:items bind:percentages bind:selected bind:valid={listValid} />
  <svelte:fragment slot="actions">
    <Button on:click={modal.hide}>Cancel</Button>
    <Button on:click={submit} disabled={!listValid} icon={Wallet} variant="primary"
      >Confirm changes in wallet</Button
    >
  </svelte:fragment>
</StepLayout>
