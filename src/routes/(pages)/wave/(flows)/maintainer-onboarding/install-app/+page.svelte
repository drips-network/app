<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubOrgBadge from '$lib/components/wave/github-org-badge/github-org-badge.svelte';
  import getOptionalEnvVar from '$lib/utils/get-optional-env-var/public.js';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  const WAVE_GITHUB_APP_NAME = getOptionalEnvVar(
    'PUBLIC_WAVE_GITHUB_APP_NAME',
    true,
    'Links to install the Wave app wont work',
  );

  let { data } = $props();
</script>

<FlowStepWrapper
  headline="Install Drips Wave on GitHub"
  description="To sync your repositories with Drips Wave and enter them into a Wave, install the Wave GitHub App on one or more of your organization or personal accounts."
>
  {#if data.userOrgs.data.length > 0}
    <Card>
      <div class="org-list">
        <h5 style:text-align="left">Existing installations</h5>
        {#each data.userOrgs.data as org}
          <GithubOrgBadge displayPersonalBadge org={org.org} />
        {/each}
      </div>
    </Card>
  {/if}

  <div>
    <Button
      icon={ArrowBoxUpRight}
      size="large"
      variant="primary"
      href="https://github.com/apps/{WAVE_GITHUB_APP_NAME}/installations/new"
    >
      Install GitHub App
    </Button>
  </div>

  {#snippet actions()}
    <Button
      variant="primary"
      href="/wave/maintainer-onboarding/review-repos"
      icon={ArrowRight}
      disabled={data.userOrgs.data.length === 0}>Review synced repos</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .org-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
