<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ProjectCustomizer from '$lib/components/project-customizer/project-customizer.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import transact, { makeTransactPayload } from '$lib/components/stepper/utils/transact';
  import RepoDriverMetadataManager from '$lib/utils/metadata/RepoDriverMetadataManager';
  import type { ClaimedGitProject } from '$lib/utils/metadata/types';
  import Wallet from 'radicle-design-system/icons/Wallet.svelte';
  import { createEventDispatcher } from 'svelte';
  import { writable } from 'svelte/store';
  import assert from '$lib/utils/assert';
  import MetadataManagerBase from '$lib/utils/metadata/MetadataManagerBase';
  import { getRepoDriverClient } from '$lib/utils/get-drips-clients';
  import type { StepComponentEvents } from '$lib/components/stepper/types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let project: ClaimedGitProject;

  let projectWritable = writable(structuredClone(project));

  $: changesMade =
    project.emoji !== $projectWritable.emoji || project.color !== $projectWritable.color;

  function submit() {
    const metadataManager = new RepoDriverMetadataManager();

    transact(
      dispatch,
      makeTransactPayload({
        before: async () => {
          const currentMetadata = (
            await metadataManager.fetchAccountMetadata(project.repoDriverAccount.accountId)
          )?.data;
          assert(currentMetadata, 'No metadata found for account');

          const newMetadata = {
            ...currentMetadata,
            emoji: $projectWritable.emoji,
            color: $projectWritable.color,
          };

          const upgradedMetadata = metadataManager.upgradeAccountMetadata(newMetadata);

          const ipfsHash = await metadataManager.pinAccountMetadata(upgradedMetadata);

          const accountMetadataAsBytes = [
            {
              key: MetadataManagerBase.USER_METADATA_KEY,
              value: ipfsHash,
            },
          ];

          const repoDriverClient = await getRepoDriverClient();

          const emitAccountMetadataTx = repoDriverClient.emitAccountMetadata(
            project.repoDriverAccount.accountId,
            accountMetadataAsBytes,
          );

          return { emitAccountMetadataTx };
        },

        transactions: ({ emitAccountMetadataTx }) => ({ transaction: () => emitAccountMetadataTx }),
      }),
    );
  }
</script>

<StepLayout>
  <ProjectCustomizer project={projectWritable} />
  <svelte:fragment slot="actions">
    <Button on:click={submit} disabled={!changesMade} variant="primary" icon={Wallet}
      >Confirm changes in wallet</Button
    >
  </svelte:fragment>
</StepLayout>
