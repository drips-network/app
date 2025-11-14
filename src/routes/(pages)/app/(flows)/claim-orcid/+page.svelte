<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { browser } from '$app/environment';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import CLaimOrcidStepper from '$lib/flows/claim-orcid-flow/claim-orcid-stepper.svelte';

  onMount(() => browser && (window.onbeforeunload = () => true));
  onDestroy(() => browser && (window.onbeforeunload = null));
</script>

<HeadMeta title="Claim ORCID iD" />

<CLaimOrcidStepper displaySlots />
