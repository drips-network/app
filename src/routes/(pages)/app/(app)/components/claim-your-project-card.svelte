<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import RepoGitProject from '$lib/components/illustrations/repo-git-project.svelte';
  import launchClaimProject from '$lib/utils/launch-claim-project';
</script>

<div class="claim-card">
  <div class="illustration">
    <RepoGitProject />
  </div>
  <div class="content">
    <h2 class="pixelated typo-header-1">Claim your project</h2>
    <p>If you develop an open-source project, claim it on Drips to start collecting funds.</p>
  </div>
  <div class="actions">
    <Button icon={Plus} on:click={() => launchClaimProject()} variant="primary"
      >Claim your project</Button
    >
  </div>
</div>

<style>
  .claim-card {
    display: flex;
    align-items: center;
    gap: 3rem;
    padding: 2rem 3rem;
    background-color: var(--color-primary-level-1);
    border-radius: 1rem;
    border: 1px solid var(--color-primary-level-2);
  }

  .illustration {
    width: 186px;
    height: 186px;
    color: var(--color-primary);
  }

  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  @media (max-width: 768px) {
    .claim-card {
      flex-direction: column;
      text-align: center;
      gap: 1.5rem;
      padding: 0 2rem 2rem 2rem;
    }

    .content {
      flex: 0;
    }
  }
</style>
