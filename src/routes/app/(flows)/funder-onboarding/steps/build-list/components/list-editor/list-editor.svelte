<script lang="ts" context="module">
  export type { Items, ListItem };

  export type Percentages = { [slug: string]: number };
</script>

<script lang="ts">
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items, ListItem } from '$lib/components/list-select/list-select.types';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import isValidUrl from '$lib/utils/is-valid-url';
  import CheckIcon from 'radicle-design-system/icons/Check.svelte';
  import ExclamationIcon from 'radicle-design-system/icons/Exclamation.svelte';
  import Git from 'radicle-design-system/icons/Git.svelte';
  import { fade, scale } from 'svelte/transition';
  import projectItem from './item-templates/project';
  import type { GitProject } from '$lib/utils/metadata/types';
  import GitProjectService from '$lib/utils/project/GitProjectService';
  import { onMount } from 'svelte';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import unclaimedHeader from './item-templates/unclaimed-header';

  let selected: string[] = ['svelte-stepper', 'svelte-stored-writable', 'foo-bar'];
  let percentages: Percentages = {};

  export let selectedPercentages: Percentages;
  $: selectedPercentages = Object.fromEntries(
    Object.entries(percentages).filter(([slug]) => selected.includes(slug)),
  );

  export let items: Items = {
    'svelte-stepper': {
      type: 'selectable',
      label: {
        component: ProjectBadge,
        props: {
          project: {
            claimed: true,
            repoDriverAccount: {
              userId: '0',
              driver: 'repo',
            },
            owner: {
              driver: 'address',
              userId: '0',
              address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
            },
            source: {
              forge: 'github',
              repoName: 'svelte-stepper',
              ownerName: 'efstajas',
              url: 'https://github.com/efstajas/svelte-stepper.git',
            },
            emoji: '🚶',
            color: '#fcc842',
          },
          linkTo: 'nothing',
        },
      },
      editablePercentage: {
        initialWeight: 500000,
      },
    },
    'svelte-stored-writable': {
      type: 'selectable',
      label: {
        component: ProjectBadge,
        props: {
          project: {
            claimed: true,
            repoDriverAccount: {
              userId: '0',
              driver: 'repo',
            },
            owner: {
              driver: 'address',
              userId: '0',
              address: '0x99505B669C6064BA2B2f26f2E4fffa5e8d906299',
            },
            source: {
              forge: 'github',
              repoName: 'svelte-stored-writable',
              ownerName: 'efstajas',
              url: 'https://github.com/efstajas/svelte-stepper.git',
            },
            emoji: '💾',
            color: '#FF0000',
          },
          linkTo: 'nothing',
        },
      },
      editablePercentage: {
        initialWeight: 500000,
      },
    },
    unclaimedHeader,
    'foo-bar': {
      type: 'selectable',
      label: {
        component: ProjectBadge,
        props: {
          project: {
            claimed: false,
            repoDriverAccount: {
              userId: '0',
              driver: 'repo',
            },
            source: {
              forge: 'github',
              repoName: 'svelte-stored-writable',
              ownerName: 'efstajas',
              url: 'https://github.com/efstajas/svelte-stepper.git',
            },
          },
          linkTo: 'nothing',
        },
      },
      editablePercentage: {
        initialWeight: 500000,
      },
    },
  };

  let gitProjectService: GitProjectService | undefined = undefined;

  onMount(async () => {
    gitProjectService = await GitProjectService.new();
  });

  async function addProject() {
    if (!gitProjectService) gitProjectService = await GitProjectService.new();
    addInProgress = true;

    const id = crypto.randomUUID();

    items[id] = projectItem({
      claimed: false,
      repoDriverAccount: {
        userId: '0',
        driver: 'repo',
      },
      source: {
        forge: 'github',
        repoName: 'svelte-stored-writable',
        ownerName: 'efstajas',
        url: 'https://github.com/efstajas/svelte-stepper.git',
      },
    } as GitProject);

    projectUrlInputValue = '';

    selected.push(id);

    addInProgress = false;
  }

  let addInProgress = false;

  let projectUrlInputValue = '';

  $: if (isValidUrl(projectUrlInputValue)) {
    addProject();
  }

  $: totalPercentage = Object.values(selectedPercentages ?? {}).reduce<number>(
    (acc, v) => acc + v,
    0,
  );
  export let valid = false;
  $: valid = selected.length > 0 && totalPercentage === 100;
  export let error = false;
  $: error = totalPercentage > 100;

  $: canDistributeEvenly = selected.length > 0;

  function distributeEvenly() {
    const percentage = 100 / selected.length;

    selected.forEach((id) => {
      percentages[id] = percentage;
    });
  }

  $: canDistributeRemaining =
    Object.values(selectedPercentages).filter((v) => v === 0).length > 0 &&
    Object.values(selectedPercentages).find((v) => v !== 0);

  function distributeRemaining() {
    const remaining = 100 - totalPercentage;

    const remainingIds = Object.entries(selectedPercentages)
      .filter(([, v]) => v === 0)
      .map(([id]) => id);

    const percentage = remaining / remainingIds.length;

    remainingIds.forEach((id) => {
      percentages[id] = percentage;
    });
  }

  $: canClearPercentages = Object.values(selectedPercentages).filter((v) => v !== 0).length > 0;

  function clearPercentages() {
    percentages = Object.fromEntries(Object.keys(items).map((i) => [i, 0]));
  }
</script>

<div class="list-editor">
  <div class="add-project">
    <div class="icon">
      <Git style="fill: var(--color-foreground)" />
    </div>
    <input
      bind:value={projectUrlInputValue}
      disabled={addInProgress}
      class="typo-text"
      type="text"
      placeholder="Paste GitHub or GitLab URL"
    />
    {#if addInProgress}
      <Spinner />
    {/if}
  </div>
  <div class="list">
    <ListSelect
      bind:percentages
      bind:selected
      searchable={false}
      multiselect
      {items}
      showEmptyState={false}
    />
  </div>
  <div class="distribution-tools">
    <div class="actions">
      <button class="typo-text-small" on:click={distributeEvenly} disabled={!canDistributeEvenly}
        >Distribute evenly</button
      >
      <button
        class="typo-text-small"
        on:click={distributeRemaining}
        disabled={!canDistributeRemaining}>Distribute remaining</button
      >
      <button class="typo-text-small" on:click={clearPercentages} disabled={!canClearPercentages}
        >Clear distribution</button
      >
    </div>
    <div class="remaining-percentage-indicator" class:error class:valid>
      <div class="typo-text-small-bold">
        {Math.round(totalPercentage)}% allocated
      </div>
      <div class="pie">
        <svg height="32" width="32" viewBox="0 0 32 32">
          {#if !error && !valid}
            <circle
              transition:fade={{ duration: 200 }}
              r="12"
              cx="16"
              cy="16"
              fill="var(--color-primary-level-1"
            />
          {/if}
          <circle
            class="pie-piece"
            r="6"
            cx="16"
            cy="16"
            fill="transparent"
            stroke-width="12"
            stroke-dasharray="calc({totalPercentage} * 37.6991118431 / 100) 37.6991118431"
            transform="rotate(-90) translate(-32)"
          /></svg
        >
        {#if error}
          <div
            class="icon"
            in:scale={{ duration: 300, start: 1.5 }}
            out:scale={{ duration: 300, start: 0.8 }}
          >
            <ExclamationIcon style="fill: var(--color-background);" />
          </div>
        {:else if valid}
          <div
            class="icon"
            in:scale={{ duration: 300, start: 1.5 }}
            out:scale={{ duration: 300, start: 0.8 }}
          >
            <CheckIcon style="fill: var(--color-background);" />
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<style>
  .list {
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 0 0 1.5rem 1.5rem;
    overflow: hidden;
  }

  .add-project {
    display: flex;
    gap: 0.75rem;
    padding: 1rem;
    background-color: var(--color-background);
    box-shadow: var(--elevation-low);
    border-radius: 1rem 0 0 0;
  }

  .add-project input {
    width: 100%;
  }

  .add-project input:disabled {
    color: var(--color-foreground-level-5);
  }

  .add-project input:focus {
    outline: none;
  }

  .distribution-tools {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
    user-select: none;
  }

  .distribution-tools .actions {
    display: flex;
    gap: 1rem;
    text-decoration: underline;
  }

  .distribution-tools .actions button:disabled {
    opacity: 0.5;
  }

  .remaining-percentage-indicator {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.25rem;
  }

  .remaining-percentage-indicator.error {
    color: var(--color-negative);
  }

  .remaining-percentage-indicator.valid {
    color: var(--color-positive-level-6);
  }

  .remaining-percentage-indicator .pie {
    overflow: visible;
    position: relative;
  }

  .remaining-percentage-indicator .pie .icon {
    position: absolute;
    top: 4px;
    left: 4px;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    transition: all 0.2s;
  }

  .remaining-percentage-indicator .pie .pie-piece {
    stroke: var(--color-primary);
  }

  .remaining-percentage-indicator.error .pie .pie-piece {
    stroke: var(--color-negative);
  }

  .remaining-percentage-indicator.valid .pie .pie-piece {
    stroke: var(--color-positive-level-6);
  }

  .typo-text-small {
    font-weight: normal;
    font-family: var(--typeface-regular);
  }
</style>
