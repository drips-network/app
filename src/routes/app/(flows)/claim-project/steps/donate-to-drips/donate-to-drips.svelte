<script lang="ts">
  import Button from "$lib/components/button/button.svelte";
  import Check from "radicle-design-system/icons/Check.svelte";
  import StandaloneFlowStepLayout from "../../../components/standalone-flow-step-layout/standalone-flow-step-layout.svelte";
  import VisualPercentageEditor from "$lib/components/visual-percentage-editor/visual-percentage-editor.svelte";
  import type { Writable } from "svelte/store";
  import type { State } from "../../claim-project-flow";
  import User from "radicle-design-system/icons/User.svelte";
  import Droplet from "radicle-design-system/icons/Droplet.svelte";
  import Splits from "radicle-design-system/icons/Splits.svelte";
  import { tweened } from "svelte/motion";
  import { createEventDispatcher, onMount } from "svelte";
  import type { StepComponentEvents } from "$lib/components/stepper/types";
  import { quintOut } from "svelte/easing";
  import scalePercentage from "$lib/utils/scale-percentage";

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<State>;

  const DEFAULT_DONATION_PERCENTAGE = 5;
  
  const percentages = tweened({
    'maintainers': $context.highLevelPercentages.maintainers,
    'dependencies': $context.highLevelPercentages.dependencies,
    'drips': 0,
  });

  let highlightId: string | undefined;
  onMount(() => {
    percentages.set({
      'maintainers': scalePercentage($context.highLevelPercentages.maintainers, 0, 100 - DEFAULT_DONATION_PERCENTAGE),
      'dependencies': scalePercentage($context.highLevelPercentages.dependencies, 0, 100 - DEFAULT_DONATION_PERCENTAGE),
      'drips': DEFAULT_DONATION_PERCENTAGE,
    }, { duration: 2000, easing: quintOut });

    setTimeout(() => {
      highlightId = 'drips';
    }, 1500);
  });

  function applyDonation() {

  }
</script>

<StandaloneFlowStepLayout
  headline="Donate to Drips"
  description="We'll use donated funds to continue maintaing and developing the Drips Network as a free, public good."
>

<VisualPercentageEditor editable={false} items={[
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
  }
]}
{highlightId}
showPercentages={Boolean(highlightId)}
bind:percentages={$percentages}
/>

<svelte:fragment slot="actions">
  <Button
    on:click={() => dispatch('goForward')}>No, thanks</Button
  >
  <Button
    icon={Check}
    variant="primary"
    on:click={applyDonation}>Add 5% Drips Donation</Button
  >
</svelte:fragment>

</StandaloneFlowStepLayout>
