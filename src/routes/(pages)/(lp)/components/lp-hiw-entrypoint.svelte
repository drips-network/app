<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Marquee from 'svelte-fast-marquee';
</script>

<div class="lp-hiw-entrypoint">
  <div class="text">
    <h1>How things work</h1>
    <p>
      Achieve any funding mechanism you can dream of with our global splitting graph and powerful
      set of building blocks.
    </p>
    <div><Button href="https://docs.drips.network" target="_blank">Learn more</Button></div>
  </div>
  <Marquee gap="1rem" speed={50}>
    <img
      src="/assets/lp/hiw-marquee/drip-list-card.png"
      alt="Drip List"
      height="234px"
      width="314px"
      loading="lazy"
    />
    <img
      src="/assets/lp/hiw-marquee/identity-card.png"
      alt="Identity"
      height="234px"
      width="314px"
      loading="lazy"
    />
    <img
      src="/assets/lp/hiw-marquee/orcid-card.png"
      alt="ORCID"
      height="234px"
      width="314px"
      loading="lazy"
    />
    <img
      src="/assets/lp/hiw-marquee/project-card.png"
      alt="Project"
      height="234px"
      width="314px"
      loading="lazy"
    />
  </Marquee>
</div>

<style>
  .lp-hiw-entrypoint {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    padding: 2rem 0;
    max-width: 100%;
    text-align: center;
    border-radius: 2rem 0 2rem 2rem;
    background-color: var(--color-background);
    border: 1px solid var(--color-foreground-level-2);
  }

  .text {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 600px;
    padding: 0 2rem;
  }
</style>
