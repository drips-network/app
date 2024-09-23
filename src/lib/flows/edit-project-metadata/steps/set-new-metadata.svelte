<script lang="ts" context="module">
  export const SET_NEW_METADATA_STEP_FRAGMENT = gql`
    ${PROJECT_CUSTOMIZER_FRAGMENT}
    fragment SetNewMetadataStep on Project {
      ...ProjectCustomizer
      account {
        accountId
      }
      chainData {
        ... on ClaimedProjectData {
          avatar {
            ... on EmojiAvatar {
              emoji
            }
            ... on ImageAvatar {
              cid
            }
          }
          color
        }
      }
    }
  `;
</script>

<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ProjectCustomizer, {
    PROJECT_CUSTOMIZER_FRAGMENT,
  } from '$lib/components/project-customizer/project-customizer.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import assert from '$lib/utils/assert';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import { makeTransactPayload, type StepComponentEvents } from '$lib/components/stepper/types';
  import { gql } from 'graphql-request';
  import type { SetNewMetadataStepFragment } from './__generated__/gql.generated';
  import type { LatestVersion } from '@efstajas/versioned-parser';
  import type { repoDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';
  import { populateRepoDriverWriteTx } from '$lib/utils/sdk/repo-driver/repo-driver';
  import { toBigInt } from 'ethers';
  import keyValueToMetatada from '$lib/utils/sdk/utils/key-value-to-metadata';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import type { ClaimedProjectData } from '$lib/graphql/__generated__/base-types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let project: SetNewMetadataStepFragment;
  let projectChainData = filterCurrentChainData(project.chainData) as ClaimedProjectData;

  let projectWritable = writable(structuredClone(project));
  let projectWritableChainData = filterCurrentChainData(
    $projectWritable.chainData,
  ) as ClaimedProjectData;

  $: changesMade =
    projectChainData.avatar !== projectWritableChainData.avatar ||
    projectChainData.color !== projectWritableChainData.color;

  let valid = false;

  function submit() {
    const metadataManager = new RepoDriverMetadataManager();

    dispatch(
      'transact',
      makeTransactPayload({
        headline: 'Update project metadata',
        before: async () => {
          const { accountId } = project.account;

          const currentMetadata = (await metadataManager.fetchAccountMetadata(accountId))?.data;
          assert(currentMetadata, 'No metadata found for account');

          const upgraded = metadataManager.upgradeAccountMetadata(currentMetadata);

          const newMetadata: LatestVersion<typeof repoDriverAccountMetadataParser> = {
            ...upgraded,
            avatar:
              projectWritableChainData.avatar.__typename === 'EmojiAvatar'
                ? {
                    type: 'emoji',
                    emoji: projectWritableChainData.avatar.emoji,
                  }
                : {
                    type: 'image',
                    cid: projectWritableChainData.avatar.cid,
                  },
            color: projectWritableChainData.color,
          };

          const upgradedMetadata = metadataManager.upgradeAccountMetadata(newMetadata);

          const ipfsHash = await metadataManager.pinAccountMetadata(upgradedMetadata);

          const accountMetadataAsBytes = [
            {
              key: MetadataManagerBase.USER_METADATA_KEY,
              value: ipfsHash,
            },
          ].map(keyValueToMetatada);

          const tx = await populateRepoDriverWriteTx({
            functionName: 'emitAccountMetadata',
            args: [toBigInt(accountId), accountMetadataAsBytes],
          });

          return { tx, ipfsHash, accountId };
        },

        transactions: ({ tx }) => [
          { transaction: tx, applyGasBuffer: false, title: 'Update project metadata' },
        ],

        after: async (_, { accountId, ipfsHash }) => {
          await waitForAccountMetadata(accountId, ipfsHash);
          await invalidateAccountCache(accountId);
          await invalidateAll();
        },
      }),
    );
  }
</script>

<StepLayout>
  <ProjectCustomizer bind:valid project={projectWritable} />
  <svelte:fragment slot="actions">
    <Button on:click={submit} disabled={!changesMade || !valid} variant="primary" icon={Wallet}
      >Confirm changes</Button
    >
  </svelte:fragment>
</StepLayout>
