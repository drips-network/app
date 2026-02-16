<script lang="ts">
  import buildExternalUrl from '$lib/utils/build-external-url';
  import ChevronRight from '$lib/components/icons/ChevronRight.svelte';
  import Link from '$lib/components/icons/Link.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import type { orgContactInfoSchema } from '$lib/utils/wave/types/waveProgram';
  import type { Snippet } from 'svelte';
  import type { z } from 'zod';

  interface Props {
    org: {
      id: string;
      gitHubOrgLogin: string;
      gitHubOrgAvatarUrl: string | null;
      contactInfo: z.infer<typeof orgContactInfoSchema> | null;
    };
    actions?: Snippet;
  }

  let { org, actions }: Props = $props();
</script>

<Card>
  <div class="org-item">
    <a class="org-header" href="/wave/orgs/{org.id}">
      <UserAvatar size={24} src={org.gitHubOrgAvatarUrl ?? undefined} />
      <span class="org-name typo-text">{org.gitHubOrgLogin}</span>
      <ChevronRight style="margin-left: auto;" />
    </a>

    <span class="description typo-text-small line-clamp-2">
      {#if org.contactInfo?.description}
        {org.contactInfo.description}
      {:else}
        <span style:color="var(--color-foreground-level-4)">No description</span>
      {/if}
    </span>

    <div class="spacer"></div>

    {#if org.contactInfo?.url && URL.canParse(org.contactInfo.url)}
      <a class="website typo-text-small" href={buildExternalUrl(org.contactInfo.url)}>
        <Link style="width: 16px; height: 16px;" />
        {new URL(org.contactInfo.url).hostname}
      </a>
    {/if}

    {#if actions}
      <div>
        {@render actions()}
      </div>
    {/if}
  </div>
</Card>

<style>
  .org-item {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    height: 100%;
  }

  .spacer {
    flex: 1;
  }

  .org-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: inherit;
    text-decoration: none;
  }

  .org-name {
    overflow-wrap: anywhere;
  }

  .description {
    color: var(--color-foreground-level-6);
    min-height: 2lh;
  }

  .website {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-foreground-level-5);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
</style>
