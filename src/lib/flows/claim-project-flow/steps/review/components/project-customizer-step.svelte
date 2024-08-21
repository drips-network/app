<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { ProjectCustomizerFragment } from '$lib/components/project-customizer/__generated__/gql.generated';
  import ProjectCustomizer from '$lib/components/project-customizer/project-customizer.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { createEventDispatcher } from 'svelte';
  import { get, type Writable } from 'svelte/store';
  import type { State } from '../../../claim-project-flow';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import type { ClaimedProjectData } from '$lib/graphql/__generated__/base-types';

  export let context: Writable<State>;
  export let project: Writable<ProjectCustomizerFragment>;

  const dispatch = createEventDispatcher<StepComponentEvents>();

  function handleConfirm() {
    const { avatar, color } = filterCurrentChainData(get(project).chainData) as ClaimedProjectData;

    $context.avatar =
      avatar.__typename === 'EmojiAvatar'
        ? {
            type: 'emoji',
            emoji: avatar.emoji,
          }
        : {
            type: 'image',
            cid: avatar.cid,
          };
    $context.projectColor = color;

    dispatch('conclude');
  }
</script>

<StepLayout>
  <ProjectCustomizer {project} />
  <div class="flex justify-end">
    <Button icon={CheckCircle} on:click={handleConfirm}>Confirm</Button>
  </div>
</StepLayout>
