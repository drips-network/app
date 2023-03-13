<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ens from '$lib/stores/ens';
  import { ethers } from 'ethers';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import { createEventDispatcher } from 'svelte';

  export let value: string | undefined = undefined;
  export let validatedValue: string | undefined = undefined;

  type ExclusionGroup = {
    addresses: (string | undefined)[];
    msg: string;
  };

  export let exclude: ExclusionGroup[] = [
    {
      addresses: [],
      msg: 'You cannot use this address.',
    },
  ];

  const dispatch = createEventDispatcher();

  let addressValidationState: TextInputValidationState = { type: 'unvalidated' };

  async function validateAddress(input: string | undefined) {
    if (!input) {
      addressValidationState = { type: 'unvalidated' };
      validatedValue = undefined;
      return;
    }

    if (input.endsWith('.eth')) {
      // lookup ENS
      addressValidationState = {
        type: 'pending',
      };

      const address = await ens.reverseLookup(input);

      if (address) {
        validatedValue = address;
        value = address;

        addressValidationState = {
          type: 'valid',
        };
      } else {
        validatedValue = undefined;
        addressValidationState = {
          type: 'invalid',
          message: 'Unable to resolve ENS name',
        };
      }
    } else if (input && ethers.utils.isAddress(input)) {
      // is address
      validatedValue = input;

      const exclusionMatch = exclude.find((group: ExclusionGroup) =>
        group.addresses.includes(input),
      );

      if (exclusionMatch) {
        // is excluded!
        addressValidationState = {
          type: 'invalid',
          message: exclusionMatch.msg,
        };
      } else {
        // valid
        addressValidationState = {
          type: 'valid',
        };
      }
    } else {
      // invalid
      validatedValue = undefined;
      addressValidationState = {
        type: 'invalid',
        message: 'Enter either an ENS name or valid Ethereum address',
      };
    }
  }
  $: validateAddress(value);
  $: dispatch('validationChange', addressValidationState);
</script>

<TextInput
  autocomplete
  autocapitalize={false}
  autocorrect={false}
  showSuccessCheck
  validationState={addressValidationState}
  bind:value
  placeholder="ENS name or ETH address"
/>
