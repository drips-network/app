<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import CreateDripListStepper from '$lib/flows/create-drip-list-flow/create-drip-list-stepper.svelte';

  export let data;

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));
</script>

<HeadMeta title="Create Drip List" />

<CreateDripListStepper displaySlots blueprintOrBlueprintError={data.blueprintOrBlueprintError} />
