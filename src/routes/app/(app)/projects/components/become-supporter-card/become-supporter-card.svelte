<script lang="ts">
  import Heart from 'radicle-design-system/icons/Heart.svelte';
  import Sun from 'radicle-design-system/icons/Sun.svelte';
  import type { ClaimedGitProject } from '../../types';
  import ProjectAvatar from '$lib/components/project-avatar/project-avatar.svelte';
  import Button from '$lib/components/button/button.svelte';

  export let project: ClaimedGitProject;
</script>

<div class="become-supporter-card">
  <div class="header">
    <div class="background" />
    <div class="circles">
      <div class="circle">
        <Heart style="height: 3rem; width: 3rem; fill: var(--color-primary)" />
      </div>
      <div>
        <ProjectAvatar {project} size="large" outline />
      </div>
    </div>
  </div>
  <h2 class="pixelated">Become a supporter</h2>
  <!-- TODO: Real supporter values. -->
  <p>
    Join <b>radworks.eth</b>, <b>maker-dao.eth</b> and 23 others in supporting
    <b>{project.source.repoName}</b> on Drips.
  </p>
  <Button size="large" icon={Heart} variant="primary">Support this project</Button>
  <div class="benefits typo-text-small">
    You'll get…
    <div class="benefit">
      <Sun />
      <span>…a shiny supporter badge on your profile.</span>
    </div>
    <div class="benefit">
      <Heart />
      <span>…to feel good about yourself, because you're helping fund open-source software..</span>
    </div>
  </div>
</div>

<style>
  .become-supporter-card {
    border-radius: 1rem 0 1rem 1rem;
    box-shadow: var(--elevation-medium);
    background-color: var(--color-background);
    display: flex;
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
  }

  .header > .background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    opacity: 0.4;
    background-color: var(--color-primary-level-2);
    height: 3rem;
  }

  .header > .circles {
    display: flex;
    position: relative;
  }

  .header > .circles > *:not(:first-child) {
    margin-left: -1.5rem;
  }

  .header > .circles > .circle {
    width: 4rem;
    height: 4rem;
    margin: 1px;
    background-color: var(--color-background);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--elevation-low);
  }

  .benefits {
    color: var(--color-foreground-level-5);
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .benefits > .benefit {
    display: flex;
    gap: 0.5rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  b {
    font-weight: bold;
  }
</style>
