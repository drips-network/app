<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageProps } from './$types';
  import Header from '$lib/components/wave/header/header.svelte';

  let {
    data,
    children,
  }: PageProps & {
    children: Snippet;
  } = $props();
</script>

<div class="layout-container">
  <div class="header-container">
    <Header user={data.user} />
  </div>
  {@render children()}
</div>

<style>
</style>
