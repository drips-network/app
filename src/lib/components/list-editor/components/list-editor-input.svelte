<script lang="ts">
  import { createEventDispatcher, onMount, tick } from 'svelte';
  import type {
    ListEditorDripListFragment,
    ListEditorProjectFragment,
  } from '../__generated__/gql.generated';
  import Button from '$lib/components/button/button.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import { isSupportedGitUrl } from '$lib/utils/is-valid-git-url';
  import { BASE_URL } from '$lib/utils/base-url';
  import query from '$lib/graphql/dripsQL';
  import { gql } from 'graphql-request';
  import { LIST_EDITOR_DRIP_LIST_FRAGMENT, LIST_EDITOR_PROJECT_FRAGMENT } from '../types';
  import ensStore from '$lib/stores/ens/ens.store';
  import assert from '$lib/utils/assert';
  import type {
    GetDripListQuery,
    GetDripListQueryVariables,
    GetProjectQuery,
    GetProjectQueryVariables,
  } from './__generated__/gql.generated';
  import { isAddress } from 'ethers/lib/utils';
  import { getAddressDriverClient } from '$lib/utils/get-drips-clients';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import DripList from '$lib/components/icons/DripList.svelte';
  import List from '$lib/components/icons/List.svelte';
  import ExclamationCircle from '$lib/components/icons/ExclamationCircle.svelte';
  import { slide } from 'svelte/transition';
  import { buildRepositoryURL, isDripsProjectUrl } from '$lib/utils/build-repo-url';

  const dispatch = createEventDispatcher<{
    addAddress: { accountId: string; address: string };
    addProject: { accountId: string; project: ListEditorProjectFragment };
    addDripList: { accountId: string; dripList: ListEditorDripListFragment };
  }>();

  export let maxItemsReached: boolean;
  export let existingKeys: string[];
  export let blockedAccountIds: string[];

  export let allowDripLists: boolean;
  export let allowProjects: boolean;
  export let allowAddresses: boolean;

  export let weightsMode: boolean;

  export let addOnMount: string | undefined;

  let inputElem: HTMLInputElement;
  let inputValue = addOnMount ?? '';

  onMount(() => {
    if (addOnMount) {
      handleSubmit(addOnMount);
    }
  });

  $: validInput =
    (allowProjects && (isSupportedGitUrl(inputValue) || isDripsProjectUrl(inputValue))) ||
    (allowAddresses && (inputValue.endsWith('.eth') || isAddress(inputValue))) ||
    (allowDripLists && inputValue.includes(`${BASE_URL}/app/drip-lists/`));

  class AddItemError extends Error {
    constructor(
      message: string,
      public severity: 'warning' | 'error',
    ) {
      super(message);
    }
  }

  function checkCanAdd(accountId: string) {
    if (blockedAccountIds.includes(accountId)) {
      throw new AddItemError(`You can't add this right now.`, 'warning');
    }

    if (existingKeys.includes(accountId)) {
      throw new AddItemError('Already added', 'warning');
    }
  }

  async function addDripsProject(urlValue: string) {
    return addProject(buildRepositoryURL(urlValue));
  }

  async function addProject(urlValue: string) {
    let url = urlValue;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    if (url.endsWith('/')) {
      url = url.slice(0, -1);
    }

    const repoInfoRes = await fetch(`/api/github/${encodeURIComponent(url)}`);
    const repoInfo = await repoInfoRes.json();
    const normalizedUrl = repoInfo.url;

    if (!normalizedUrl) {
      throw new AddItemError("Couldn't find that Git project. Is it private?", 'warning');
    }

    const res = await query<GetProjectQuery, GetProjectQueryVariables>(
      gql`
        ${LIST_EDITOR_PROJECT_FRAGMENT}
        query GetProject($url: String!) {
          project: projectByUrl(url: $url) {
            ...ListEditorProject
            account {
              accountId
            }
          }
        }
      `,
      { url: normalizedUrl },
    );

    if (res.project) {
      checkCanAdd(res.project.account.accountId);
      dispatch('addProject', { accountId: res.project.account.accountId, project: res.project });
    }
  }

  async function addAddress(addressValue: string) {
    let address: string;

    if (isAddress(addressValue)) {
      address = addressValue;
    } else {
      const resolved = await ensStore.reverseLookup(inputValue);
      if (!resolved) throw new AddItemError('Invalid ENS name', 'error');

      address = resolved;
    }

    const addressDriverClient = await getAddressDriverClient();
    const accountId = await addressDriverClient.getAccountIdByAddress(address);

    checkCanAdd(accountId);

    dispatch('addAddress', {
      accountId,
      address,
    });
  }

  async function addDripList(dripListUrlValue: string) {
    const dripListId = dripListUrlValue.substring(inputValue.lastIndexOf('/') + 1);
    assert(dripListId);

    const res = await query<GetDripListQuery, GetDripListQueryVariables>(
      gql`
        ${LIST_EDITOR_DRIP_LIST_FRAGMENT}
        query GetDripList($id: ID!, $chain: SupportedChain!) {
          dripList: dripList(id: $id, chain: $chain) {
            ...ListEditorDripList
            account {
              accountId
            }
          }
        }
      `,
      { id: dripListId },
    );

    if (res.dripList) {
      checkCanAdd(res.dripList.account.accountId);

      dispatch('addDripList', {
        accountId: res.dripList.account.accountId,
        dripList: res.dripList,
      });
    }
  }

  let currentError: { message: string; severity: 'warning' | 'error' } | undefined = undefined;
  function displayError(error: NonNullable<typeof currentError>) {
    currentError = error;
  }
  function clearError() {
    currentError = undefined;
  }
  $: {
    inputValue;
    if (inputValue !== '') clearError();
  }

  let inputPlaceholder: string;
  $: {
    const allowed = mapFilterUndefined(
      [
        allowProjects && ('GitHub URL' as const),
        allowAddresses && ('ETH address' as const),
        allowDripLists && ('Drip List URL' as const),
      ],
      (v) => (v ? v : undefined),
    );

    if (allowed.length === 0) {
      inputPlaceholder = '';
    } else if (allowed.length === 1) {
      inputPlaceholder = allowed[0];
    } else {
      inputPlaceholder = `${allowed
        .filter((_, i, a) => i !== a.length - 1)
        .join(', ')}, or ${allowed.pop()}`;
    }
  }

  let loading = false;

  function handleKeydown(e: KeyboardEvent) {
    if (validInput && e.key === 'Enter') {
      handleSubmit(inputValue);
    }
  }

  function handlePaste() {
    setTimeout(() => {
      if (validInput) {
        handleSubmit(inputValue);
      }
    });
  }

  async function handleSubmit(value: string) {
    if (maxItemsReached) {
      displayError(new AddItemError('Maximum amount of items reached', 'warning'));
      return;
    }

    loading = true;

    try {
      if (isSupportedGitUrl(value)) {
        await addProject(value);
      } else if (value.endsWith('.eth') || isAddress(value)) {
        await addAddress(value);
      } else if (value.includes(`${BASE_URL}/app/drip-lists/`)) {
        await addDripList(value);
      } else if (value.includes(`${BASE_URL}/app/projects/`)) {
        await addDripsProject(value);
      }
    } catch (e) {
      if (e instanceof AddItemError) {
        displayError(e);
      } else if (e instanceof Error) {
        displayError({ message: e.message || 'Unknown error', severity: 'error' });

        // eslint-disable-next-line no-console
        console.error(e);
      }
    }

    loading = false;
    await tick();

    inputValue = '';
    inputElem.focus();
  }
</script>

<div class="list-editor-input typo-text">
  {#if weightsMode}
    <DripList style="fill: var(--color-foreground)" />
  {:else}
    <List style="fill: var(--color-foreground)" />
  {/if}
  <input
    bind:this={inputElem}
    on:keydown={handleKeydown}
    on:paste={handlePaste}
    disabled={loading}
    bind:value={inputValue}
    type="text"
    placeholder={inputPlaceholder}
  />
  <Button
    size="small"
    icon={Plus}
    disabled={loading || !validInput || maxItemsReached}
    variant={validInput ? 'primary' : undefined}
    {loading}
    on:click={() => handleSubmit(inputValue)}>Add</Button
  >
</div>

{#if currentError}
  {@const color = currentError.severity === 'error' ? 'negative' : 'caution'}
  {@const textColor = `var(--color-${color}-level-6)`}
  <div
    transition:slide|global={{ duration: 300 }}
    class="error {currentError.severity}"
    style:background-color="var(--color-{color}-level-1)"
    style:color={textColor}
  >
    <ExclamationCircle style="fill: {textColor}" />
    {currentError.message}
  </div>
{/if}

<style>
  .list-editor-input {
    display: flex;
    padding: 0.75rem;
    padding-left: 1rem;
    align-items: center;
    gap: 0.75rem;
  }

  .list-editor-input:not(:last-child) {
    border-bottom: 1px solid var(--color-foreground);
  }

  input {
    flex: 1;
  }

  input:focus {
    outline: none;
  }

  .error {
    height: 3.5rem;
    padding: 0.75rem;
    padding-left: 1rem;
    gap: 0.75rem;
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--color-foreground);
  }
</style>
