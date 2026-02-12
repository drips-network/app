<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import buildExternalUrl from '$lib/utils/build-external-url';
  import Envelope from '$lib/components/icons/Envelope.svelte';
  import Folder from '$lib/components/icons/Folder.svelte';
  import Fork from '$lib/components/icons/Fork.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Globe from '$lib/components/icons/Globe.svelte';
  import Telegram from '$lib/components/icons/Telegram.svelte';
  import Twitter from '$lib/components/icons/Twitter.svelte';
  import Link from '$lib/components/icons/Link.svelte';
  import Star from '$lib/components/icons/Star.svelte';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Section from '$lib/components/section/section.svelte';
  import SectionSkeleton from '$lib/components/section-skeleton/section-skeleton.svelte';
  import SectionHeader from '$lib/components/section-header/section-header.svelte';
  import User from '$lib/components/icons/User.svelte';
  import ProgrammingLanguageBreakdown from '$lib/components/programming-language-breakdown/programming-language-breakdown.svelte';
  import convertGhLanguageListToLanguageProfile from '$lib/components/programming-language-breakdown/convert-gh-language-list-to-language-profile';
  import type { IssueFilters } from '$lib/utils/wave/types/issue';
  import type { WaveProgramRepoWithDetailsDto } from '$lib/utils/wave/types/waveProgram';
  import { getWaveProgramRepos } from '$lib/utils/wave/wavePrograms';

  let { data } = $props();
  let { org, members, wavePrograms, initialRepos, user } = $derived(data);

  const isCurrentUserMember = $derived(user ? members.some((m) => m.id === user.id) : false);

  const hasContactInfo = $derived(
    org.contactInfo?.description ||
      org.contactInfo?.email ||
      org.contactInfo?.url ||
      org.contactInfo?.location ||
      (org.contactInfo?.socialLinks && org.contactInfo.socialLinks.length > 0),
  );

  let selectedWaveProgramId = $state<string | undefined>(undefined);

  const waveProgramOptions = $derived(
    wavePrograms.map((wp) => ({ value: wp.id, title: `${wp.name} Wave` })),
  );

  // Set initial selection when data loads
  $effect(() => {
    if (wavePrograms.length > 0 && !selectedWaveProgramId) {
      selectedWaveProgramId = wavePrograms[0].id;
    }
  });

  let repos = $state<WaveProgramRepoWithDetailsDto[]>(initialRepos?.data ?? []);
  let reposTotalCount = $state(initialRepos?.pagination.total ?? 0);
  let loadingRepos = $state(false);

  // Re-sync repos when initialRepos changes (e.g. navigation)
  $effect(() => {
    repos = initialRepos?.data ?? [];
    reposTotalCount = initialRepos?.pagination.total ?? 0;
  });

  const selectedWaveProgram = $derived(wavePrograms.find((wp) => wp.id === selectedWaveProgramId));

  async function handleWaveProgramChange(value: string) {
    loadingRepos = true;
    try {
      const result = await getWaveProgramRepos(undefined, value, { limit: 7 }, { orgId: org.id });
      repos = result.data;
      reposTotalCount = result.pagination.total;
    } finally {
      loadingRepos = false;
    }
  }

  function getIssueFilterString(repoId: string) {
    const filters: IssueFilters = {
      repoId,
      state: 'open',
    };
    return btoa(JSON.stringify(filters));
  }

  function getOrgReposFilterString() {
    return btoa(JSON.stringify({ orgId: org.id }));
  }

  const MAX_VISIBLE_REPOS = 6;
  const visibleRepos = $derived(repos.slice(0, MAX_VISIBLE_REPOS));
  const hasOverflow = $derived(reposTotalCount > MAX_VISIBLE_REPOS);
</script>

<HeadMeta
  title="{org.gitHubOrgLogin} | Drips Wave"
  description="Organization profile for {org.gitHubOrgLogin} on Drips Wave."
/>

<div class="wrapper">
  <Breadcrumbs
    crumbs={[
      { label: 'Explore Orgs', href: '/wave/orgs' },
      { label: org.gitHubOrgLogin, href: '' },
    ]}
  />

  <div class="page">
    <div class="org-info">
      <Card style="height: fit-content;">
        <div class="org-info-inner">
          <div class="avatar-and-name">
            <UserAvatar size={128} src={org.gitHubOrgAvatarUrl ?? undefined} />
            <h1>{org.gitHubOrgLogin}</h1>
            {#if org.accountType === 'User'}
              <span class="personal-chip typo-text-small">Personal org</span>
            {/if}
          </div>

          {#if org.contactInfo?.description}
            <p class="description typo-text" style:color="var(--color-foreground-level-6)">
              {org.contactInfo.description}
            </p>
          {/if}

          {#if org.contactInfo?.location || org.contactInfo?.email || org.contactInfo?.url || (org.contactInfo?.socialLinks && org.contactInfo.socialLinks.length > 0)}
            <ul class="contact-details">
              {#if org.contactInfo.location}
                <li class="contact-item">
                  <Globe style="flex-shrink: 0;" />
                  <span class="typo-text-small">{org.contactInfo.location}</span>
                </li>
              {/if}
              {#if org.contactInfo.email}
                <li class="contact-item">
                  <Envelope style="flex-shrink: 0;" />
                  <a class="typo-text-small" href="mailto:{org.contactInfo.email}">
                    {org.contactInfo.email}
                  </a>
                </li>
              {/if}
              {#if org.contactInfo.url}
                <li class="contact-item">
                  <Link style="flex-shrink: 0;" />
                  <a class="typo-text-small" href={buildExternalUrl(org.contactInfo.url)}>
                    {org.contactInfo.url}
                  </a>
                </li>
              {/if}
              {#each org.contactInfo.socialLinks as social (social.url)}
                <li class="contact-item">
                  {#if social.provider === 'twitter'}
                    <Twitter style="flex-shrink: 0;" />
                    <a class="typo-text-small" href={buildExternalUrl(social.url)}>
                      @{new URL(social.url).pathname.split('/').filter(Boolean).pop()}
                    </a>
                  {:else if social.url.includes('t.me') || social.url.includes('telegram.me')}
                    <Telegram style="flex-shrink: 0;" />
                    <a class="typo-text-small" href={buildExternalUrl(social.url)}> Telegram </a>
                  {:else if social.url.includes('discord.gg') || social.url.includes('discord.com/invite')}
                    <Discord style="flex-shrink: 0;" />
                    <a class="typo-text-small" href={buildExternalUrl(social.url)}> Discord </a>
                  {:else}
                    <Globe style="flex-shrink: 0;" />
                    <a class="typo-text-small" href={buildExternalUrl(social.url)}>
                      {social.provider}
                    </a>
                  {/if}
                </li>
              {/each}
            </ul>
          {/if}

          <Button
            icon={ArrowBoxUpRight}
            href="https://github.com/{org.gitHubOrgLogin}"
            target="_blank"
          >
            View on GitHub
          </Button>

          {#if isCurrentUserMember && !hasContactInfo}
            <AnnotationBox type="info">
              Consider adding contact information to your GitHub {org.accountType === 'User'
                ? ''
                : 'organization '}profile so contributors can reach you. It will be automatically
              synced into Drips Wave.
            </AnnotationBox>
          {/if}
        </div>
      </Card>
    </div>

    <div class="content">
      <Section
        header={{ icon: User, label: 'Members on Drips Wave', count: members.length }}
        skeleton={{
          loaded: true,
          empty: members.length === 0,
          emptyStateEmoji: '🫗',
          emptyStateHeadline: 'No members yet',
          emptyStateText: 'No members of this organization have signed up for Drips Wave yet.',
          horizontalScroll: false,
        }}
      >
        <ul class="members-list">
          {#each members as member (member.id)}
            <li>
              <a class="member-row" href="/wave/users/{member.id}">
                <UserAvatar size={32} src={member.gitHubAvatarUrl ?? undefined} />
                <div class="member-info">
                  <span class="typo-text">{member.gitHubUsername}</span>
                  {#if member.gitHubName}
                    <span class="typo-text-small" style:color="var(--color-foreground-level-5)"
                      >{member.gitHubName}</span
                    >
                  {/if}
                </div>
                <ChevronRight style="margin-left: auto; flex-shrink: 0;" />
              </a>
            </li>
          {/each}
        </ul>
      </Section>

      {#if wavePrograms.length > 0}
        <div class="section repos-section">
          <div class="repos-header">
            <SectionHeader
              icon={Folder}
              label="Repos"
              infoTooltip="This only displays repos that are approved for at least one Wave Program."
            />
            <div class="wave-program-dropdown">
              <Dropdown
                small
                options={waveProgramOptions}
                bind:value={selectedWaveProgramId}
                onchange={handleWaveProgramChange}
              />
            </div>
          </div>

          <SectionSkeleton
            loaded={!loadingRepos}
            empty={repos.length === 0}
            emptyStateEmoji="🫗"
            emptyStateHeadline="No repos"
            emptyStateText="This organization has no repos approved for the selected wave program."
            horizontalScroll={false}
          >
            <div class="repos-grid-wrapper" class:has-overflow={hasOverflow}>
              <div class="repos-grid">
                {#each visibleRepos as { repo, org: repoOrg, issueCount, pointsMultiplier } (repo.id)}
                  {@const isFeatured = pointsMultiplier && pointsMultiplier > 1}
                  <Card
                    style={isFeatured
                      ? 'background: linear-gradient(135deg, var(--color-caution-level-1) 0%, transparent 50%);'
                      : undefined}
                  >
                    <div class="repo-item">
                      <div
                        class="top"
                        style:display="flex"
                        style:flex-direction="column"
                        style:gap="0.5rem"
                      >
                        <div class="owner-and-repo">
                          <UserAvatar size={24} src={repoOrg.gitHubOrgAvatarUrl ?? undefined} />

                          <a
                            class="repo-name typo-text line-clamp-2"
                            href="https://github.com/{repo.gitHubRepoFullName}"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <span style:color="var(--color-foreground-level-5)">
                              {repo.gitHubRepoFullName.split('/')[0]} /
                            </span>
                            {repo.gitHubRepoFullName.split('/')[1]}
                          </a>

                          {#if isFeatured}
                            <span class="featured-badge">{pointsMultiplier}x Points</span>
                          {/if}
                        </div>

                        <span class="repo-description typo-text-small line-clamp-2">
                          {#if repo.description}
                            {repo.description}
                          {:else}
                            <span style:color="var(--color-foreground-level-4)">No description</span
                            >
                          {/if}
                        </span>

                        <div class="languages">
                          <ProgrammingLanguageBreakdown
                            size="compact"
                            languageProfile={convertGhLanguageListToLanguageProfile(repo.languages)}
                          />
                        </div>
                      </div>

                      <div class="bottom-row">
                        <Button
                          size="small"
                          disabled={issueCount === 0}
                          href={selectedWaveProgram
                            ? `/wave/${selectedWaveProgram.slug}/issues?filters=${getIssueFilterString(repo.id)}`
                            : undefined}
                        >
                          {#if issueCount === 0}
                            No open issues
                          {:else}
                            View {issueCount} issue{issueCount === 1 ? '' : 's'}
                          {/if}
                        </Button>

                        <div class="repo-stats">
                          <span class="stat">
                            <Star style="width: 1rem; height: 1rem;" />
                            {repo.stargazersCount?.toString() ?? '0'}
                          </span>
                          <span class="stat">
                            <Fork style="width: 1rem; height: 1rem;" />
                            {repo.forksCount?.toString() ?? '0'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                {/each}
              </div>

              {#if hasOverflow && selectedWaveProgram}
                <div class="overflow-action">
                  <Button
                    icon={ArrowRight}
                    href={`/wave/${selectedWaveProgram.slug}/repos?filters=${getOrgReposFilterString()}`}
                  >
                    View all {reposTotalCount}
                  </Button>
                </div>
              {/if}
            </div>
          </SectionSkeleton>
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 90rem;
    width: 100%;
    margin: 0 auto;
  }

  .page {
    display: grid;
    grid-template-columns: 20rem 1fr;
    grid-template-areas: 'org-info content';
    gap: 2rem;
  }

  .org-info {
    grid-area: org-info;
    position: sticky;
    top: 5rem;
    align-self: start;
  }

  .org-info-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .avatar-and-name {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .org-info h1 {
    font-size: 1.75rem;
    overflow-wrap: anywhere;
    text-align: center;
  }

  .personal-chip {
    margin-top: -0.5rem;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;
    background-color: var(--color-foreground-level-1);
    color: var(--color-foreground-level-5);
  }

  .description {
    text-align: center;
  }

  .contact-details {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .contact-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .contact-item a {
    overflow-wrap: anywhere;
  }

  .content {
    grid-area: content;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .members-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-foreground-level-2);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .members-list li + li {
    border-top: 1px solid var(--color-foreground-level-2);
  }

  .member-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    color: inherit;
    text-decoration: none;
    transition: background-color 0.15s;
  }

  .member-row:hover {
    background-color: var(--color-foreground-level-1);
  }

  .member-info {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .repos-section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .repos-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .wave-program-dropdown {
    max-width: 16rem;
  }

  .repos-grid-wrapper {
    position: relative;
  }

  .repos-grid-wrapper.has-overflow::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 8rem;
    background: linear-gradient(to bottom, transparent, var(--color-background));
    pointer-events: none;
  }

  .repos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
    gap: 1rem;
  }

  .overflow-action {
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 1;
    margin-top: -2rem;
  }

  .repo-item {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 1.5rem;
  }

  .repo-name {
    overflow-wrap: anywhere;
  }

  .owner-and-repo {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
  }

  .repo-description {
    min-height: 2lh;
    color: var(--color-foreground-level-6);
  }

  .languages {
    margin-top: 0.25rem;
  }

  .bottom-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  .repo-stats {
    display: flex;
    gap: 0.75rem;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-level-5);
    font-size: 0.875rem;
  }

  .featured-badge {
    background-color: var(--color-caution-level-1);
    color: var(--color-caution-level-6);
    padding: 0.125rem 0.5rem;
    border-radius: 1rem 0 1rem 1rem;
    font-size: 0.75rem;
    font-weight: 600;
    white-space: nowrap;
    margin-left: auto;
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .page {
      grid-template-columns: 1fr;
      grid-template-areas:
        'org-info'
        'content';
    }

    .org-info {
      position: static;
    }
  }
</style>
