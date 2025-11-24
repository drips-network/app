<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageProps } from './$types';
  import Header from '$lib/components/wave/header/header.svelte';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';

  let {
    data,
    children,
  }: PageProps & {
    children: Snippet;
  } = $props();
</script>

<ModalLayout />

<div class="header-container">
  <Header user={data.user} />
</div>

<div class="layout-container">
  {@render children()}
</div>

<style>
  .layout-container {
    padding: 1rem;
  }
</style>
