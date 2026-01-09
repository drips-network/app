<script lang="ts">
  import { invalidate } from '$app/navigation';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Setting from '$lib/components/setting/setting.svelte';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';
  import { patchNotificationPreference, WORKFLOW_ID } from '$lib/utils/wave/notifications';
  import { setNewsletterSubscription } from '$lib/utils/wave/profile';
  import { SvelteMap } from 'svelte/reactivity';

  let { data } = $props();
  let { newsletterStatus } = $derived(data);

  interface WorkflowProperties {
    title: string;
    description: string;
    category: 'maintainer' | 'contributor';
  }

  const NOTIFICATION_FRIENDLY_MAP: {
    [workflowId in WORKFLOW_ID]: WorkflowProperties | null;
  } = {
    //contributor

    [WORKFLOW_ID.ISSUE_APPLICATION_RECEIVED]: {
      title: 'Issue application received',
      description: 'You successfully applied to work on an issue in a Wave.',
      category: 'contributor',
    },
    [WORKFLOW_ID.ISSUE_APPLICATION_APPROVED]: {
      title: 'Issue application approved',
      description:
        'Your application to work on an issue in a Wave has been approved, and you may begin work on it.',
      category: 'contributor',
    },
    [WORKFLOW_ID.COMPLIMENT_RECEIVED]: {
      title: 'Compliment received',
      description:
        'You have received a compliment from a maintainer for your work on an issue in a Wave.',
      category: 'contributor',
    },
    [WORKFLOW_ID.ISSUE_POINTS_RECEIVED]: {
      title: 'Issue points received',
      description:
        'You have received points for successfully resolving an issue as part of a Wave.',
      category: 'contributor',
    },
    [WORKFLOW_ID.CONTRIBUTOR_UNASSIGNED]: {
      title: 'Contributor unassigned',
      description: 'You have been unassigned from an issue in a Wave by a maintainer.',
      category: 'contributor',
    },
    [WORKFLOW_ID.OPEN_ISSUE_REMINDER_CONTRIBUTORS]: {
      title: 'Open issue reminder',
      description:
        'Receive a reminder shortly before a Wave ends if you still any open issues assigned to you through Wave.',
      category: 'contributor',
    },

    // maintainer

    [WORKFLOW_ID.WELCOME]: null,
    [WORKFLOW_ID.REPO_APPLIED_TO_WAVE]: {
      title: 'Repo applied to Wave',
      description: 'One of your repositories has been applied to join a Wave Program.',
      category: 'maintainer',
    },
    [WORKFLOW_ID.REPO_APPLICATION_APPROVED]: {
      title: 'Repo application approved',
      description: 'Your application for a repository to join a Wave Program has been approved.',
      category: 'maintainer',
    },
    [WORKFLOW_ID.REPO_APPLICATION_REJECTED]: {
      title: 'Repo application rejected',
      description: 'Your application for a repository to join a Wave Program has been rejected.',
      category: 'maintainer',
    },
    [WORKFLOW_ID.ORG_ISSUE_APPLICATION_RECEIVED]: {
      title: 'Issue application received',
      description:
        'A contributor has applied to work on an issue belonging to one of your repos in a Wave.',
      category: 'maintainer',
    },
    [WORKFLOW_ID.CONTRIBUTOR_WITHDREW]: {
      title: 'Contributor withdrew',
      description:
        'A contributor you previously assigned has withdrawn from working on an issue in a Wave.',
      category: 'maintainer',
    },
    [WORKFLOW_ID.OPEN_ISSUE_REMINDER_MAINTAINERS]: {
      title: 'Open issue reminder',
      description:
        'Receive a reminder shortly before a Wave ends if you still have any open issues assigned to contributors.',
      category: 'maintainer',
    },
  };

  const categories = Object.values(NOTIFICATION_FRIENDLY_MAP)
    .filter((c): c is WorkflowProperties => c !== null)
    .reduce<Set<WorkflowProperties['category']>>((acc, curr) => {
      acc.add(curr.category);
      return acc;
    }, new Set());

  function getPreferencesForWorkflow(
    preferences: (typeof data)['preferences'],
    workflowId: WORKFLOW_ID,
  ) {
    const res = preferences.find((pref) => pref.workflowId === workflowId)?.channels;

    if (!res) throw new Error(`No preferences found for workflow ID: ${workflowId}`);

    return res;
  }

  let updatingWorkflowChannels = new SvelteMap<`${WORKFLOW_ID}-${'email' | 'inApp'}`, boolean>();

  async function handleUpdate(
    workflowId: WORKFLOW_ID,
    channel: 'email' | 'inApp',
    enabled: boolean,
  ) {
    updatingWorkflowChannels.set(`${workflowId}-${channel}`, true);
    try {
      doWithErrorModal(() =>
        patchNotificationPreference(undefined, workflowId, {
          [channel]: enabled,
        }),
      );
    } finally {
      await invalidate('wave:user:notifications-preferences');

      updatingWorkflowChannels.delete(`${workflowId}-${channel}`);
    }
  }

  async function handleNewsletterToggle(enabled: boolean) {
    await doWithErrorModal(async () => {
      await setNewsletterSubscription(enabled);
      await invalidate('wave:user:notifications-preferences');
    });
  }
</script>

<HeadMeta title="Notifications | Settings | Wave" />

{#snippet setting(
  channel: WorkflowProperties,
  workflowId: WORKFLOW_ID,
  preferences: {
    email: boolean;
    inApp: boolean;
  },
)}
  <Setting title={channel.title} subtitle={channel.description}>
    <div class="toggles">
      <div class="toggle">
        <h5 class="mobile-only">EMAIL</h5>
        <Toggle
          disabled={updatingWorkflowChannels.has(`${workflowId}-email`)}
          checked={preferences.email}
          onchange={() => handleUpdate(workflowId, 'email', !preferences.email)}
        />
      </div>

      <div class="toggle">
        <h5 class="mobile-only">IN-APP</h5>
        <Toggle
          disabled={updatingWorkflowChannels.has(`${workflowId}-inApp`)}
          checked={preferences.inApp}
          onchange={() => handleUpdate(workflowId, 'inApp', !preferences.inApp)}
        />
      </div>
    </div>
  </Setting>
{/snippet}

<Setting
  title="Email address"
  subtitle="To change this, update your primary email address on GitHub, then log out and back into Drips Wave."
>
  <span class="typo-text">{data.user?.email}</span>
</Setting>

<div class="newsletter">
  <Setting
    title="Drips Wave Newsletter"
    subtitle="Receive occasional updates on new Waves, features, and more."
  >
    <Toggle checked={newsletterStatus.isSubscribed} onchange={(v) => handleNewsletterToggle(v)} />
  </Setting>
</div>

<div class="notifications-table">
  {#each categories as category (category)}
    <div class="category">
      <div class="category-header">
        <h5>{category}</h5>
        <div class="desktop-only toggles">
          <div class="toggle">
            <h5>EMAIL</h5>
          </div>

          <div class="toggle">
            <h5>IN-APP</h5>
          </div>
        </div>
      </div>
      {#each Object.entries(NOTIFICATION_FRIENDLY_MAP).filter(([_, channel]) => channel?.category === category) as [workflowId, channel] (workflowId)}
        {#if channel}
          {@render setting(
            channel,
            workflowId as WORKFLOW_ID,
            getPreferencesForWorkflow(data.preferences, workflowId as WORKFLOW_ID),
          )}
        {/if}
      {/each}
    </div>
  {/each}
</div>

<style>
  .notifications-table {
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .category {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .toggles {
    display: flex;
    width: 10rem;
    gap: 2rem;
  }

  .toggle {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 6rem;
    gap: 0.125rem;
  }

  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  h5 {
    color: var(--color-foreground-level-6);
  }

  @media (min-width: 1022px) {
    .mobile-only {
      display: none;
    }
  }

  @media (max-width: 1024px) {
    .desktop-only {
      display: none;
    }

    .category {
      gap: 2rem;
    }

    .toggles {
      width: auto;
      gap: 2rem;
    }

    .toggle {
      justify-content: space-between;
    }
  }
</style>
