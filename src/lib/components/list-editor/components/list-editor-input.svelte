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
  import { type RecipientResult } from '../types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import DripList from '$lib/components/icons/DripList.svelte';
  import List from '$lib/components/icons/List.svelte';
  import { isDripsProjectUrl } from '$lib/utils/build-repo-url';
  import ListEditorInputError from './list-editor-input-error.svelte';
  import { AddItemError } from '../errors';
  import { classifyRecipient } from '$lib/components/list-editor/classifiers';
  import { isAddress } from 'ethers';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher<{
    addAddress: { accountId: string; address: string };
    addProject: { accountId: string; project: ListEditorProjectFragment };
    addDripList: { accountId: string; dripList: ListEditorDripListFragment };
    errorDismissed: void;
  }>();

  export let maxItemsReached: boolean;
  export let existingKeys: string[];
  export let blockedAccountIds: string[];

  export let allowDripLists: boolean;
  export let allowProjects: boolean;
  export let allowAddresses: boolean;

  export let weightsMode: boolean;

  export let addOnMount: string | undefined;

  export let errors: Array<AddItemError> = [];

  let inputElem: HTMLInputElement;
  let inputValue = addOnMount ?? '';

  onMount(() => {
    if (addOnMount) {
      handleSubmit(addOnMount);
    }
  });

  $: validInput =
    (allowProjects && (isSupportedGitUrl(inputValue) || isDripsProjectUrl(inputValue))) ||
    (allowAddresses &&
      ((network.ensSupported && inputValue.endsWith('.eth')) || isAddress(inputValue))) ||
    (allowDripLists && inputValue.includes(`${BASE_URL}/app/drip-lists/`));

  function createInvalidMessage(type: string, value: string): string {
    switch (type) {
      case 'address': {
        if (isAddress(value)) {
          return "This isn't a valid wallet address";
        }

        return 'Invalid ENS name';
      }
      case 'project':
        return "Couldn't find that Git project. Is it private?";
      case 'drip-list':
        return "This isn't a recognized Drip List";
      default:
        return "This isn't valid";
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

  function dispatchUpdate(recipientResult: RecipientResult) {
    if (recipientResult?.address) {
      dispatch('addAddress', {
        accountId: recipientResult.accountId,
        address: recipientResult.address,
      });
      return;
    }

    if (recipientResult?.project) {
      dispatch('addProject', {
        accountId: recipientResult.accountId,
        project: recipientResult.project,
      });
      return;
    }

    if (recipientResult?.dripList) {
      dispatch('addDripList', {
        accountId: recipientResult.accountId,
        dripList: recipientResult.dripList,
      });
    }
  }

  function displayError(error: NonNullable<(typeof errors)[0]>) {
    errors = [error];
  }

  function clearError() {
    errors = [];
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

  function handleErrorDismiss() {
    clearError();
    dispatch('errorDismissed');
  }

  async function handleSubmit(value: string) {
    if (maxItemsReached) {
      displayError(new AddItemError('Maximum amount of items reached', 'warning'));
      return;
    }

    loading = true;

    try {
      const classification = classifyRecipient(value);
      // if classification is null, we don't do anything for now
      const isValid = await classification?.validate();
      const type = classification?.type || 'unknown';
      // the input ain't valid
      if (!isValid) {
        throw new AddItemError(createInvalidMessage(type, value), 'error');
      }

      const recipientResult = await classification?.fetch();
      // for some reason, we didn't get a good response
      if (!recipientResult) {
        throw new AddItemError('We failed to get information for this.', 'error');
      }

      checkCanAdd(recipientResult.accountId);
      dispatchUpdate(recipientResult);
    } catch (e) {
      if (e instanceof AddItemError) {
        displayError(e);
      } else if (e instanceof Error) {
        displayError(new AddItemError(e.message || 'Unknown error', 'error'));

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

<ListEditorInputError error={errors[0]} on:dismiss={handleErrorDismiss} />

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
</style>
