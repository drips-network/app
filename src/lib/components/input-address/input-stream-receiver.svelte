<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ens from '$lib/stores/ens';
  import { ethers } from 'ethers';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { createEventDispatcher } from 'svelte';
  import { BASE_URL } from '$lib/utils/base-url';
  import assert from '$lib/utils/assert';
  import { extractDriverNameFromAccountId } from '$lib/utils/sdk/utils/extract-driver-from-accountId';
  import network from '$lib/stores/wallet/network';

  export let value: string | undefined = undefined;
  export let validatedValue: string | undefined = undefined;

  type ExclusionGroup = {
    addresses: (string | undefined)[];
    msg: string;
  };

  export let exclude: ExclusionGroup[] = [{ addresses: [], msg: 'You cannot use this address.' }];

  const dispatch = createEventDispatcher();

  let inputValidationState: TextInputValidationState = { type: 'unvalidated' };

  async function validateInput(input: string | undefined) {
    if (!input) {
      inputValidationState = { type: 'unvalidated' };
      validatedValue = undefined;
      return;
    }

    if (input.includes(`${BASE_URL}/app/drip-lists/`)) {
      inputValidationState = {
        type: 'pending',
      };

      const dripListId = input.substring(input.lastIndexOf('/') + 1);
      assert(dripListId);

      if (extractDriverNameFromAccountId(dripListId) !== 'nft') {
        inputValidationState = {
          type: 'invalid',
          message: 'Invalid Drip List URL',
        };

        throw new Error('Invalid Drip List URL');
      }

      if (dripListId) {
        validatedValue = dripListId;
        value = dripListId;

        inputValidationState = {
          type: 'valid',
        };
      } else {
        validatedValue = undefined;
        inputValidationState = {
          type: 'invalid',
          message: 'Unable to resolve Drip List URL',
        };
      }
    } else if (network.ensSupported && input.endsWith('.eth')) {
      // lookup ENS
      inputValidationState = {
        type: 'pending',
      };

      const address = await ens.reverseLookup(input);

      if (address) {
        validatedValue = address;
        value = address;

        inputValidationState = {
          type: 'valid',
        };
      } else {
        validatedValue = undefined;
        inputValidationState = {
          type: 'invalid',
          message: 'Unable to resolve ENS name',
        };
      }
    } else if (input && ethers.isAddress(input)) {
      // is address
      validatedValue = input;

      const exclusionMatch = exclude.find((group: ExclusionGroup) =>
        group.addresses.includes(input),
      );

      if (exclusionMatch) {
        // is excluded!
        inputValidationState = {
          type: 'invalid',
          message: exclusionMatch.msg,
        };
      } else {
        // valid
        inputValidationState = {
          type: 'valid',
        };
      }
    } else {
      // invalid
      validatedValue = undefined;
      inputValidationState = {
        type: 'invalid',
        message: `Enter a valid Ethereum address${network.ensSupported ? ', ENS name,' : ''} or Drip List URL.`,
      };
    }
  }

  // ensure initial value is validated since validateInput() is async
  if (value?.length) {
    validateInput(value).then(() => dispatch('validationChange', inputValidationState));
  }

  $: validateInput(value);
  $: dispatch('validationChange', inputValidationState);
</script>

<TextInput
  autocomplete
  autocapitalize={false}
  autocorrect={false}
  showSuccessCheck
  validationState={inputValidationState}
  bind:value
  placeholder="Ethereum address{network.ensSupported ? ', ENS name,' : ''} or Drip List URL"
/>
