<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import RpgfApplicationBadge from '$lib/components/rpgf-application-badge/rpgf-application-badge.svelte';

  export let data;
  $: round = data.wrappedRound.round;
  $: application = data.application;
  $: applicationFormat = round.applicationFormat.filter((f) => 'slug' in f);
</script>

<div class="application">
  <div>
    <Button href="/app/rpgf/rounds/{round.urlSlug}/applications" icon={ArrowLeft}
      >Back to applications</Button
    >
  </div>
  <div class="card">
    <RpgfApplicationBadge hideState {application} hideName size="huge" />
    <h1>{application.projectName}</h1>
    <ProjectBadge project={data.dripsProject} />
  </div>

  <div class="card">
    <div class="fields">
      {#each applicationFormat as field}
        {@const value = application.fields[field.slug]}
        <div class="field">
          <h2 class="typo-header-4">{field.label}</h2>
          {#if field.type === 'text' || field.type === 'textarea' || field.type === 'email'}
            <p>{value}</p>
          {:else if field.type === 'url' && typeof value === 'string'}
            <a class="typo-link" href={value} target="_blank" rel="noopener noreferrer">{value}</a>
          {/if}
          <!-- TODO(rpgf): Implement the rest of possible field types -->
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 2rem;
    border-radius: 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }

  .application {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    max-width: 45rem;
    margin: 0 auto;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .fields > .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
