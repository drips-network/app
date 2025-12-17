<script lang="ts">
  import { invalidate } from '$app/navigation';
  import Button from '$lib/components/button/button.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Refresh from '$lib/components/icons/Refresh.svelte';
  import PaddedHorizontalScroll from '$lib/components/padded-horizontal-scroll/padded-horizontal-scroll.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubOrgBadge from '$lib/components/wave/github-org-badge/github-org-badge.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import FlowStepWrapper from '../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  let refreshing = $state(false);

  async function handleRefresh() {
    refreshing = true;
    await invalidate('wave:maintainer-onboarding-review-repos');
    refreshing = false;
  }

  let orgsAndRepos = $derived.by(() => {
    const { userOrgs, ownRepos } = data;

    return userOrgs.data.map((org) => {
      return {
        ...org,
        repos: ownRepos.data.filter((repo) => repo.orgId === org.orgId),
      };
    });
  });
</script>

<FlowStepWrapper
  headline="Review orgs & repos"
  description="To adjust which repos are synced with Drips Wave, edit app settings on GitHub."
>
  <PaddedHorizontalScroll>
    <Card>
      <div class="orgs-and-repos">
        {#each orgsAndRepos as org (org.id)}
          <div class="org">
            <div class="org-line">
              <div class="badge">
                <GithubOrgBadge displayPersonalBadge org={org.org} />
              </div>
              <Button
                icon={ArrowBoxUpRight}
                href={org.org.accountType === 'User'
                  ? `https://github.com/settings/installations/${org.org.gitHubInstallationId}`
                  : `https://github.com/organizations/${org.org.gitHubOrgLogin}/settings/installations/${org.org.gitHubInstallationId}`}
                size="small">Edit settings</Button
              >
            </div>
            {#if org.repos.length > 0}
              <ul>
                {#each org.repos as repo (repo.id)}
                  <div class="repo">
                    <RepoBadge repo={{ ...repo }} />
                  </div>
                {/each}
              </ul>
            {:else}
              <p>No accessible repositories found for this organization.</p>
            {/if}
          </div>
        {/each}
      </div>
    </Card>
  </PaddedHorizontalScroll>

  <div class="notice">
    Don’t see your organization or repository?
    <div class="actions">
      <Button href="/wave/maintainer-onboarding/install-app"
        >Install app to additional organization</Button
      >
      <Button onclick={handleRefresh} icon={Refresh} loading={refreshing}>Refresh</Button>
    </div>
  </div>

  {#snippet actions()}
    <Button
      icon={ArrowRight}
      variant="primary"
      href="/wave/maintainer-onboarding/apply-to-wave-program">Continue</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .repo {
    margin-left: 1rem;
  }

  .org-line {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    gap: 0.5rem;
    min-width: 0;
  }

  .badge {
    min-width: 0;
    overflow: hidden;
  }

  .orgs-and-repos {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    min-width: 0;
  }

  .org {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .notice {
    background-color: var(--color-foreground-level-1);
    padding: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .notice .actions {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
