<script lang="ts">
  import { page } from '$app/state';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Issue from '$lib/components/icons/Issue.svelte';
  import Orgs from '$lib/components/icons/Orgs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import ShareButton from '$lib/components/share-button/share-button.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import Registered from '$lib/components/icons/Registered.svelte';
  import reportFlow from '$lib/flows/wave/report/report-flow';
  let { data } = $props();
  let { profileUserData, pointsBalance, user } = $derived(data);
  let { gitHubUsername } = $derived(profileUserData);

  const discordAccounts = $derived(
    profileUserData.linkedAccounts.filter((a) => a.provider === 'discord'),
  );

  const isOwnProfile = $derived(user?.id === profileUserData.id);
</script>

{#snippet orgMembershipsSection()}
  <Section
    header={{ icon: Orgs, label: 'Org Memberships', count: data.orgs.length }}
    skeleton={{
      loaded: true,
      empty: data.orgs.length === 0,
      emptyStateEmoji: '🫗',
      emptyStateHeadline: 'No org memberships',
      emptyStateText: 'This user is not a member of any organizations on Drips Wave.',
      horizontalScroll: false,
    }}
  >
    <ul class="orgs-list">
      {#each data.orgs as org (org.id)}
        <li>
          <a class="org-row" href="/wave/orgs/{org.id}">
            <UserAvatar size={32} src={org.gitHubOrgAvatarUrl ?? undefined} />
            <div class="org-info">
              <span class="typo-text">{org.gitHubOrgLogin}</span>
              {#if org.gitHubOrgName}
                <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
                  >{org.gitHubOrgName}</span
                >
              {/if}
            </div>
            {#if org.accountType === 'User'}
              <span class="personal-chip typo-text-small">Personal org</span>
            {/if}
            <ChevronRight style="margin-left: auto; flex-shrink: 0;" />
          </a>
        </li>
      {/each}
    </ul>
  </Section>
{/snippet}

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
          <h1>
            {gitHubUsername}{#if profileUserData.verifiedIdentity}&#8239;<span
                class="verified-badge"
                title="Successfully verified their identity on Drips Wave"
                ><Registered style="fill: var(--color-primary)" /></span
              >{/if}
          </h1>
        </div>

        <Card
          style="background-color: var(--color-caution-level-1); color: var(--color-caution-level-6); width: 100%;"
        >
          <div class="points">
            <p class="typo-header-1">{pointsBalance.totalPoints}</p>
            <h5>All-time points</h5>
          </div>
        </Card>

        <div class="actions">
          <Button
            variant="primary"
            icon={ArrowBoxUpRight}
            href="https://github.com/{gitHubUsername}"
            target="_blank">View user on GitHub</Button
          >
          <ShareButton buttonVariant="normal" url={page.url.href} />
        </div>

        <div class="divider"></div>
        <div class="linked-accounts">
          <h5>Linked accounts</h5>
          {#if discordAccounts.length > 0}
            {#each discordAccounts as account (account.providerUsername)}
              <div class="linked-account">
                <Discord style="flex-shrink: 0; fill: var(--color-foreground);" />
                <span class="typo-text">{account.providerUsername}</span>
              </div>
            {/each}
          {:else}
            <span class="typo-text" style:color="var(--color-foreground-level-4)"
              >No accounts linked</span
            >
          {/if}
          {#if isOwnProfile}
            <AnnotationBox type="info">
              Manage your linked accounts in profile settings.
              {#snippet actions()}
                <Button size="small" icon={ArrowRight} href="/wave/settings/profile"
                  >Settings</Button
                >
              {/snippet}
            </AnnotationBox>
          {/if}
        </div>

        {#if user && !isOwnProfile}
          <div class="divider"></div>
          <button
            class="report-link typo-text-small"
            onclick={() => modal.show(Stepper, undefined, reportFlow('user', profileUserData.id))}
          >
            Report user
          </button>
        {/if}
      </div>
    </Card>
  </div>

  <div class="content">
    {#if data.orgs.length > 0}
      {@render orgMembershipsSection()}
    {/if}

    <Section
      header={{
        icon: Issue,
        label: 'Resolved Issues',
        count: data.resolvedIssues.pagination.total,
      }}
      skeleton={{
        loaded: true,
        empty: data.resolvedIssues.data.length === 0,
        emptyStateEmoji: '🫗',
        emptyStateHeadline: 'No resolved issues',
        emptyStateText: 'This user has not resolved any issues through Drips Wave yet.',
        horizontalScroll: false,
      }}
    >
      <div class="issues-grid">
        {#each data.resolvedIssues.data as issue (issue.id)}
          <IssuePreviewCard {issue} />
        {/each}
      </div>
    </Section>

    {#if data.orgs.length === 0}
      {@render orgMembershipsSection()}
    {/if}
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
    align-items: stretch;
    gap: 1rem;
    position: relative;
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

  .verified-badge {
    display: inline-flex;
    vertical-align: middle;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
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

  .report-link {
    background: none;
    border: none;
    color: var(--color-foreground-level-5);
    cursor: pointer;
    padding: 0;
    align-self: start;
    transition: color 0.15s;
  }

  .report-link:hover {
    color: var(--color-foreground-level-6);
  }

  .content {
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .points {
    text-align: center;
  }

  .points p {
    font-size: 3rem;
  }

  .orgs-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .orgs-list li + li {
    border-top: 1px solid var(--color-foreground-level-2);
  }

  .org-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s;
  }

  .org-row:hover {
    background-color: var(--color-foreground-level-1);
  }

  .personal-chip {
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-5);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .org-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .org-info span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
      overflow-x: hidden;
    }

    .profile-info {
      position: static;
    }
  }
</style>
