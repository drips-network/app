<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import { createEventDispatcher } from 'svelte';
  import type { StepComponentEvents } from '../../types';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    text: string;
  }

  let { text }: Props = $props();
</script>

{text}
<Button onclick={() => dispatch('goForward')}>Continue</Button>
<Button onclick={() => dispatch('goBackward')}>Back</Button>
