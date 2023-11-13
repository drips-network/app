<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Check from 'radicle-design-system/icons/Check.svelte';
  import StandaloneFlowStepLayout from '../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import VisualPercentageEditor from '$lib/components/visual-percentage-editor/visual-percentage-editor.svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from '../../claim-project-flow';
  import User from 'radicle-design-system/icons/User.svelte';
  import Droplet from 'radicle-design-system/icons/Droplet.svelte';
  import Splits from 'radicle-design-system/icons/Splits.svelte';
  import { tweened } from 'svelte/motion';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { quintOut } from 'svelte/easing';
  import scalePercentage from '$lib/utils/scale-percentage';
  import ArrowLeft from 'radicle-design-system/icons/ArrowLeft.svelte';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  // Address of Drips multisig
  const DRIPS_DONATION_ADDRESS = '0xcC7d34C76A9d08aa0109F7Bae35f29C1CE35355A';

  const DEFAULT_DONATION_PERCENTAGE = 5;

  const repPercentages = tweened({
    maintainers: $context.highLevelPercentages.maintainers,
    dependencies: $context.highLevelPercentages.dependencies,
    drips: 0,
  });

  $: suggestedHighLevelPercentages = {
    maintainers: $context.highLevelPercentages.maintainers,
    dependencies: $context.highLevelPercentages.dependencies - DEFAULT_DONATION_PERCENTAGE,
    drips: DEFAULT_DONATION_PERCENTAGE,
  };

  let highlightId: string | undefined;
  onMount(() => {
    if (
      Object.values($context.dependencySplits.items).find(
        (v) =>
          v.type === 'address' && v.address.toLowerCase() === DRIPS_DONATION_ADDRESS.toLowerCase(),
      )
    ) {
      // Drips donation already set up, so we can skip the step
      dispatch('goForward');
    }

    if (Object.keys($context.dependencySplits.items).length + Object.keys($context.maintainerSplits.items).length >= 200) {
      // Too many dependencies and maintainers, so we have to skip the step
      dispatch('goForward');
    }

    repPercentages.set(
      suggestedHighLevelPercentages,
      { duration: 2000, easing: quintOut },
    );

    setTimeout(() => {
      highlightId = 'drips';
    }, 1500);
  });

  function applyDonation() {
    $context.dependencySplits.items[DRIPS_DONATION_ADDRESS] = {
      type: 'address',
      address: DRIPS_DONATION_ADDRESS,
    };
    $context.dependencySplits.percentages = Object.fromEntries(Object.entries($context.dependencySplits.percentages).map((p) => [
      p[0],
      scalePercentage(p[1], 0, 100 - DEFAULT_DONATION_PERCENTAGE),
    ]));

    console.log($context)

    dispatch('goForward');
  }
</script>

<StandaloneFlowStepLayout
  headline="Donate to Drips"
  description="Add Drips to your dependencies to support our work. We'll use donated funds to continue maintaing and developing the Drips Network as a free, public good."
>
  <VisualPercentageEditor
    editable={false}
    items={[
      {
        id: 'maintainers',
        label: 'Maintainers',
        overflowIcon: User,
      },
      {
        id: 'dependencies',
        label: 'Dependencies',
        overflowIcon: Splits,
      },
      {
        id: 'drips',
        label: 'Drips',
        overflowIcon: Droplet,
      },
    ]}
    {highlightId}
    showPercentages={Boolean(highlightId)}
    bind:percentages={$repPercentages}
  />

  <svelte:fragment slot="left-actions">
    <Button icon={ArrowLeft} on:click={() => dispatch('goBackward')}>Back</Button>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button on:click={() => dispatch('goForward')}>No, thanks</Button>
    <Button icon={Check} variant="primary" on:click={applyDonation}>Add 5% Drips Donation</Button>
  </svelte:fragment>
</StandaloneFlowStepLayout>
