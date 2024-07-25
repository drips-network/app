<script lang="ts" context="module">
  export const SET_NEW_METADATA_STEP_FRAGMENT = gql`
    ${PROJECT_CUSTOMIZER_FRAGMENT}
    fragment SetNewMetadataStep on ClaimedProject {
      ...ProjectCustomizer
      avatar {
        ... on EmojiAvatar {
          emoji
        }
        ... on ImageAvatar {
          cid
        }
      }
      color
      account {
        accountId
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
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import assert from '$lib/utils/assert';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import { getRepoDriverTxFactory } from '$lib/utils/get-drips-clients';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { gql } from 'graphql-request';
  import type { SetNewMetadataStepFragment } from './__generated__/gql.generated';
  import type { LatestVersion } from '@efstajas/versioned-parser';
  import type { repoDriverAccountMetadataParser } from '$lib/utils/metadata/schemas';
  import { Utils } from 'radicle-drips';
  import { waitForAccountMetadata } from '$lib/utils/ipfs';
  import invalidateAccountCache from '$lib/utils/cache/remote/invalidate-account-cache';
  import { invalidateAll } from '$lib/stores/fetched-data-cache/invalidate';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let project: SetNewMetadataStepFragment;

  let projectWritable = writable(structuredClone(project));

  $: changesMade =
    project.avatar !== $projectWritable.avatar || project.color !== $projectWritable.color;

  let valid = false;

  function submit() {
    const metadataManager = new RepoDriverMetadataManager();

    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const { accountId } = project.account;

          const currentMetadata = (await metadataManager.fetchAccountMetadata(accountId))?.data;
          assert(currentMetadata, 'No metadata found for account');

          const upgraded = metadataManager.upgradeAccountMetadata(currentMetadata);

          const newMetadata: LatestVersion<typeof repoDriverAccountMetadataParser> = {
            ...upgraded,
            avatar:
              $projectWritable.avatar.__typename === 'EmojiAvatar'
                ? {
                    type: 'emoji',
                    emoji: $projectWritable.avatar.emoji,
                  }
                : {
                    type: 'image',
                    cid: $projectWritable.avatar.cid,
                  },
            color: $projectWritable.color,
          };

          const upgradedMetadata = metadataManager.upgradeAccountMetadata(newMetadata);

          const ipfsHash = await metadataManager.pinAccountMetadata(upgradedMetadata);

          const accountMetadataAsBytes = [
            {
              key: MetadataManagerBase.USER_METADATA_KEY,
              value: ipfsHash,
            },
          ].map((m) => Utils.Metadata.createFromStrings(m.key, m.value));

          const txFactory = await getRepoDriverTxFactory();

          const tx = await txFactory.emitAccountMetadata(accountId, accountMetadataAsBytes);

          return { tx, ipfsHash, accountId };
        },

        transactions: ({ tx }) => [{ transaction: tx, applyGasBuffer: false }],

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
