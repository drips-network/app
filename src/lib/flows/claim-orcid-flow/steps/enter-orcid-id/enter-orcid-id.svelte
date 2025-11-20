<script lang="ts" module>
  import { gql } from 'graphql-request';
  export const ENTER_GIT_URL_STEP_ORCID_FRAGMENT = gql`
    ${UNCLAIMED_ORCID_CARD_FRAGMENT}
    fragment EnterGitUrlStepOrcid on OrcidLinkedIdentity {
      ...UnclaimedOrcidCard
      isClaimed
      areSplitsValid
      account {
        accountId
      }
      owner {
        address
      }
      withdrawableBalances {
        tokenAddress
      }
    }
  `;
</script>

<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { Writable } from 'svelte/store';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import { CLAIM_ORCID_FLOW_ORCID_FRAGMENT, type State } from '../../claim-orcid-flow';
  import LinkIcon from '$lib/components/icons/Link.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowRightIcon from '$lib/components/icons/ArrowRight.svelte';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { page } from '$app/stores';
  import query from '$lib/graphql/dripsQL';
  import type { OrcidQuery, OrcidQueryVariables } from './__generated__/gql.generated';
  import MagnifyingGlass from '$lib/components/icons/MagnifyingGlass.svelte';
  import network from '$lib/stores/wallet/network';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import modal from '$lib/stores/modal';
  import { loadFundingInfo } from './enter-orcid-id';
  import UnclaimedOrcidCard, {
    UNCLAIMED_ORCID_CARD_FRAGMENT,
  } from '../../../../../routes/(pages)/app/(app)/orcids/[orcidId]/components/unclaimed-orcid-card.svelte';
  import { fetchOrcid } from '../../../../utils/orcids/fetch-orcid';
  import isValidOrcidId from '$lib/utils/orcids/is-valid-orcid-id';
  import isClaimed from '$lib/utils/orcids/is-claimed';

  interface Props {
    context: Writable<State>;
    orcidId?: string | undefined;
  }

  let { context, orcidId = undefined }: Props = $props();

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let validationState = $state<TextInputValidationState>({ type: 'unvalidated' });

  let formValid = $derived(validationState.type === 'valid');

  const { searchParams } = $page.url;
  const orcidToAdd = orcidId ?? searchParams.get('orcidId') ?? undefined;

  onMount(() => {
    if (orcidToAdd) {
      $context.claimableId = orcidToAdd;
      fetchOrcidProfile();
    }
  });

  const orcidQuery = gql`
    ${CLAIM_ORCID_FLOW_ORCID_FRAGMENT}
    query Orcid($orcid: String!, $chain: SupportedChain!) {
      orcidLinkedIdentityByOrcid(orcid: $orcid, chain: $chain) {
        ...ClaimOrcidFlowOrcid
      }
    }
  `;

  class InvalidUrlError extends Error {}

  async function fetchOrcidProfile() {
    $context.linkedToClaimable = false;

    try {
      validationState = { type: 'pending' };

      const orcidInfo = await fetchOrcid($context.claimableId, fetch);
      if (!orcidInfo) {
        throw new InvalidUrlError('ORCID iD not found');
      }

      $context.claimableMetadata = orcidInfo;

      const response = await query<OrcidQuery, OrcidQueryVariables>(orcidQuery, {
        orcid: $context.claimableId,
        chain: network.gqlName,
      });

      const orcidAccount = response.orcidLinkedIdentityByOrcid;
      if (orcidAccount) {
        if (isClaimed(orcidAccount)) {
          throw new InvalidUrlError('ORCID already claimed');
        }

        if (
          orcidAccount.owner?.address.toLowerCase() === $walletStore.address?.toLowerCase() &&
          !orcidAccount.areSplitsValid
        ) {
          // The correct owner was already set previously for whatever reason. We can skip updating the owner.
          $context.isPartiallyClaimed = true;
        }

        $context.claimableAccount = orcidAccount;
      } else {
        $context.claimableAccount = {
          __typename: 'OrcidLinkedIdentity',
          account: {
            __typename: 'RepoDriverAccount',
            accountId: '',
          },
          orcid: orcidInfo.id,
          isClaimed: false,
          areSplitsValid: false,
          chain: network.gqlName,
          withdrawableBalances: [],
        };
      }

      validationState = { type: 'valid' };
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error fetching ORCID profile', error);

      if (error instanceof InvalidUrlError) {
        validationState = { type: 'invalid', message: error.message };
      } else {
        validationState = {
          type: 'invalid',
          message: 'An unexpected error occured. There may be more details in the console.',
        };
      }
    }
  }

  function clearOrcid() {
    $context.claimableAccount = undefined;
    $context.linkedToClaimable = false;
    $context.isPartiallyClaimed = false;
    $context.claimableMetadata = undefined;

    validationState = { type: 'unvalidated' };
  }

  function submitInput() {
    if (isValidOrcidId($context.claimableId)) {
      fetchOrcidProfile();
    } else {
      validationState = { type: 'invalid', message: 'Unsupported ORCID' };
    }
  }

  let inputSubmittable = $derived(
    isValidOrcidId($context.claimableId) &&
      validationState.type !== 'valid' &&
      validationState.type !== 'pending',
  );

  async function onPaste() {
    // need to wait some time for value to be available ¯\_(ツ)_/¯
    await new Promise((resolve) => setTimeout(resolve, 100));
    submitInput();
  }

  function goForward() {
    dispatch('await', {
      message: 'Gathering ORCID iD information…',
      promise: () => {
        return loadFundingInfo(context);
      },
    });
  }

  onMount(() => {
    modal.setWarnOnNavigate(true);
  });
</script>

<StandaloneFlowStepLayout
  headline="Claim your ORCID iD"
  description="Enter your ORCID iD to see if it has claimable funds and start the registration."
>
  <TextInput
    bind:value={$context.claimableId}
    icon={LinkIcon}
    placeholder="Paste your ORCID iD"
    disabled={validationState.type === 'valid' || validationState.type === 'pending'}
    {validationState}
    showClearButton={$context.claimableId.length > 0 && validationState.type !== 'pending'}
    onclear={clearOrcid}
    onkeydown={(e) => e.key === 'Enter' && submitInput()}
    onpaste={onPaste}
  />
  {#if $context.claimableAccount && validationState.type === 'valid'}
    <UnclaimedOrcidCard
      orcidAccount={$context.claimableAccount}
      claimableTokensKey="Claimable tokens"
    />
  {/if}
  {#snippet actions()}
    {#if formValid}
      <Button icon={ArrowRightIcon} variant="primary" onclick={goForward}>Continue</Button>
    {:else}
      <Button
        disabled={!inputSubmittable}
        icon={MagnifyingGlass}
        variant="primary"
        onclick={() => submitInput()}>Search</Button
      >
    {/if}
  {/snippet}
  {#snippet left_actions()}
    <Button icon={ArrowLeft} onclick={() => dispatch('goBackward')}>Back</Button>
  {/snippet}
</StandaloneFlowStepLayout>
