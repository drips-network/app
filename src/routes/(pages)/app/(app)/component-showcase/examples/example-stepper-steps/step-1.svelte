<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';

  interface Props {
    testProp: string;
  }

  let { testProp }: Props = $props();

  const dispatch = createEventDispatcher<StepComponentEvents>();

  function goForward() {
    dispatch('goForward');
  }
</script>

<h1>Step 1</h1>

<p>Step content</p>
<p>Step content</p>
<p>Step content</p>
<p>Step content</p>
<p>Step content</p>
<p>Step content</p>

<p>Test prop: {testProp}</p>

<Button onclick={goForward}>Next</Button>
