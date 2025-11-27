<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Card from '$lib/components/wave/card/card.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  let items = $derived<Items>(
    Object.fromEntries(
      data.waves.data.map((wave) => [
        wave.id,
        {
          type: 'selectable',
          label: wave.name,
        },
      ]),
    ),
  );

  let selected = $state<string[]>([]);
</script>

<FlowStepWrapper
  headline="Choose a Wave"
  description="Select which Wave you'd like to apply repos to. You'll pick specific repos in the next step."
>
  <Card style="padding: 0; text-align: left; width: 100%;">
    <ListSelect {items} bind:selected />
  </Card>

  {#snippet leftActions()}
    <Button
      icon={ArrowLeft}
      href="/wave/maintainer-onboarding/review-repos"
      disabled={data.waves.data.length === 0}>Review synced repos</Button
    >
  {/snippet}

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={selected.length === 0}
      icon={ArrowRight}
      href="/wave/maintainer-onboarding/apply-to-wave/{selected[0]}">Pick repos to apply</Button
    >
  {/snippet}
</FlowStepWrapper>
