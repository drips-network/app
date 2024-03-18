<script lang="ts">
  import { onMount } from 'svelte';
  import * as multiplayer from '$lib/utils/multiplayer';
  import type { Vote } from '$lib/utils/multiplayer/schemas';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import PropsOnlyButton from '$lib/components/button/props-only-button.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';

  export let votingRoundId: string;

  let collaborators: Vote[] | undefined;
  onMount(async () => {
    collaborators = await multiplayer.getVotingRoundVotes(votingRoundId);
  });
</script>

{#if !collaborators}
  loading...
{:else}
  <ListEditor
    isEditable={false}
    mode="list"
    items={Object.fromEntries(
      collaborators.map((c) => [
        c.collaboratorAddress,
        {
          type: 'address',
          address: c.collaboratorAddress,
          rightComponent:
            c.collaboratorAddress.toLowerCase() === $walletStore?.address?.toLowerCase()
              ? {
                  component: PropsOnlyButton,
                  props: {
                    label: 'Cast your vote',
                    buttonProps: {
                      variant: 'ghost',
                      icon: Proposals,
                    },
                  },
                }
              : undefined,
        },
      ]),
    )}
  />
{/if}
