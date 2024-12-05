<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));
</script>

<HeadMeta title="Claim GitHub project" />

<ClaimProjectStepper />
