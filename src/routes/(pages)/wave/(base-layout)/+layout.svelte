<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { PageProps } from './$types';
  import Header from '$lib/components/wave/header/header.svelte';
  import ModalLayout from '$lib/components/modal-layout/modal-layout.svelte';
  import { page } from '$app/state';

  let {
    data,
    children,
  }: PageProps & {
    children: Snippet;
  } = $props();
</script>

<ModalLayout />

<div class="header-container">
  <Header user={data.user} noBackground={page.data.waveHeaderBackground === false} />
</div>

<div class="layout-container">
  {@render children()}
</div>

<style>
  .header-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 5;
  }

  .layout-container {
    margin-top: 4rem;
    padding: 0 1rem 1rem 1rem;
    min-height: calc(100vh - 4rem);
    display: flex;
    height: fit-content;
    flex-direction: column;
  }
</style>
