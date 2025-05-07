<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Marquee from 'svelte-fast-marquee';
  import DripList from './svgs/drip-list.svelte';
  import Address from './svgs/address.svelte';
  import Orcid from './svgs/orcid.svelte';
  import ProjectCard from './svgs/project-card.svelte';
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
    <DripList />
    <Address />
    <Orcid />
    <ProjectCard />
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
