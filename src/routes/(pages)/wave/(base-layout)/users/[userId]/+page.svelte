<script lang="ts">
  import { page } from '$app/state';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Flag from '$lib/components/icons/Flag.svelte';
  import Heart from '$lib/components/icons/Heart.svelte';
  import Issue from '$lib/components/icons/Issue.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import Section from '$lib/components/section/section.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import ComplimentCard from '$lib/components/wave/compliment-card/compliment-card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import reportFlow from '$lib/flows/wave/report/report-flow';
  import { COMPLIMENT_TYPES } from '$lib/utils/wave/types/compliment.js';

  let { data } = $props();
  let { profileUserData, pointsBalance, complimentCountSummary, user } = $derived(data);
  let { gitHubUsername } = $derived(profileUserData);

  const discordAccounts = $derived(
    profileUserData.linkedAccounts.filter((a) => a.provider === 'discord'),
  );

  const COMPLIMENTS = $derived(
    complimentCountSummary.totals.map((c) => ({
      title: c.label,
      count: c.count,
      illustration: COMPLIMENT_TYPES[c.complimentType].illustration,
    })),
  );
</script>

<HeadMeta
  title="{gitHubUsername} | Drips Wave"
  description="Profile page for {gitHubUsername} on Drips Wave. With Drips Wave, contributors earn rewards for contributing in monthly contribution sprints called Waves."
/>

<div class="page">
  <div class="profile-info">
    <Card style="height: fit-content;">
      <div class="profile-info-inner">
        <div class="avatar-and-name">
          <GithubUserBadge user={profileUserData} size={128} hideName link={false} />
          <h1>{gitHubUsername}</h1>
        </div>

        <Card
          style="background-color: var(--color-caution-level-1); color: var(--color-caution-level-6); width: 100%;"
        >
          <div class="points">
            <p class="typo-header-1">{pointsBalance.totalPoints}</p>
            <h5>Points</h5>
          </div>
        </Card>

        <Button icon={ArrowBoxUpRight} href="https://github.com/{gitHubUsername}" target="_blank"
          >View user on GitHub</Button
        >

        {#if user}
          <Button
            icon={Flag}
            variant="normal"
            disabled={user.id === profileUserData.id}
            onclick={() => modal.show(Stepper, undefined, reportFlow('user', profileUserData.id))}
          >
            Report user
          </Button>
        {/if}

        <div class="share">
          <ShareButton buttonVariant="normal" url={page.url.href} />
        </div>

        {#if discordAccounts.length > 0}
          <div class="divider"></div>
          <div class="linked-accounts">
            <h5>Linked accounts</h5>
            {#each discordAccounts as account (account.providerUsername)}
              <div class="linked-account">
                <Discord style="flex-shrink: 0; fill: var(--color-foreground);" />
                <span class="typo-text">{account.providerUsername}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </Card>
  </div>

  <div class="content">
    <section>
      <SectionHeader
        count={complimentCountSummary.totalReceived}
        label="Compliments"
        icon={Heart}
      />

      <div class="compliments-list">
        {#each COMPLIMENTS as compliment (compliment.title)}
          <ComplimentCard {...compliment} />
        {/each}
      </div>
    </section>

    <section>
      <Section
        header={{
          label: 'Resolved Issues',
          icon: Issue,
          count: data.resolvedIssues.pagination.total,
        }}
        skeleton={{
          loaded: true,
          emptyStateEmoji: '🫙',
          empty: data.resolvedIssues.data.length === 0,
          emptyStateText: 'This user has not resolved any issues through Drips Wave yet.',
        }}
      >
        <div class="issues-grid">
          {#each data.resolvedIssues.data as issue (issue.id)}
            <IssuePreviewCard {issue} />
          {/each}
        </div>
      </Section>
    </section>
  </div>
</div>

<style>
  .page {
    display: grid;
    grid-template-columns: 20rem 1fr;
    grid-template-areas: 'profile-info content';
    gap: 2rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .page > * {
    min-width: 0;
  }

  .profile-info {
    grid-area: profile-info;
    position: sticky;
    top: 4.5rem;
    align-self: start;
  }

  .profile-info-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    position: relative;
  }

  .share {
    position: absolute;
    top: 0;
    right: 0;
  }

  .profile-info h1 {
    font-size: 1.75rem;
    overflow-wrap: anywhere;
    text-align: center;
  }

  .avatar-and-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .divider {
    width: 100%;
    height: 1px;
    background-color: var(--color-foreground-level-2);
  }

  .linked-accounts {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;
  }

  .linked-account {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--color-foreground);
  }

  .content {
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .points {
    text-align: center;
  }

  .points p {
    font-size: 3rem;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .compliments-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }

  .issues-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 768px) {
    .page {
      grid-template-columns: 1fr;
      grid-template-areas:
        'profile-info'
        'content';
    }

    .profile-info {
      position: static;
    }
  }
</style>
