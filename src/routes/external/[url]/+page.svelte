<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Emoji from '$lib/components/emoji/emoji.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import DripsLogo from '$lib/components/header/drips-logo.svelte';
  import LegalLinks from '$lib/components/legal-links/legal-links.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
  $: url = data.url;
</script>

<HeadMeta title="External Link" />

<div class="external-link-warning">
  <div class="logo">
    <DripsLogo />
  </div>
  <div class="content">
    <Emoji emoji="⚠️" size="huge" />
    <h1>Heads-up</h1>
    <p>You're about to leave Drips and navigate to this user-provided URL:</p>
    <p class="codeblock typo-text-mono">
      {url.toString()}
    </p>
    <p>Are you sure you want to continue?</p>
    <div class="actions">
      <a href="https://drips.network/"><Button variant="normal">Back to Drips</Button></a>
      <a href={url.href}
        ><Button variant="destructive">Continue to <b class="typo-text-bold">{url.host}</b></Button
        ></a
      >
    </div>
  </div>
  <div class="footer">
    <LegalLinks />
  </div>
</div>

<style>
  .external-link-warning {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 100vh;
    padding: 1rem;
  }

  .logo {
    height: 100%;
    max-height: 1.5rem;
  }

  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .content .actions {
    display: flex;
    gap: 1rem;
  }

  .codeblock {
    padding: 0.5rem;
    border-radius: 0.5rem;
    width: fit-content;
    max-width: 32rem;
    background-color: var(--color-foreground-level-2);
    text-align: center;
    overflow: scroll;
    margin-bottom: 1rem;
    white-space: nowrap;
  }

  p {
    text-align: center;
  }
</style>
