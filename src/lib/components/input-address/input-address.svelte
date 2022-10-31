<script lang="ts">
  import TextInput from 'radicle-design-system/TextInput.svelte';
  import ens from '$lib/stores/ens';
  import { ethers } from 'ethers';
  import type { TextInputValidationState } from 'radicle-design-system/TextInput';
  import { createEventDispatcher } from 'svelte';

  export let value: string;
  export let exclude: {
    addresses: string[];
    msg: string;
  } = {
    addresses: [],
    msg: 'You cannot use this address.',
  };

  const dispatch = createEventDispatcher();

  let addressValue: string | undefined;
  let addressValidationState: TextInputValidationState = { type: 'unvalidated' };

  async function validateAddress(input: string | undefined) {
    if (!input) {
      addressValidationState = { type: 'unvalidated' };
      addressValue = undefined;
      return;
    }

    if (input.endsWith('.eth')) {
      // lookup ENS
      addressValidationState = {
        type: 'pending',
      };

      await ens.reverseLookup(input);
      const result = Object.entries($ens).find((item) => item[1].name === input);

      if (result) {
        const [address] = result;
        addressValue = address;
        value = address;

        addressValidationState = {
          type: 'valid',
        };
      } else {
        addressValue = undefined;
        addressValidationState = {
          type: 'invalid',
          message: 'Unable to resolve ENS name',
        };
      }
    } else if (input && ethers.utils.isAddress(input)) {
      // is address
      addressValue = input;

      if (exclude.addresses.includes(input)) {
        // is excluded!
        addressValidationState = {
          type: 'invalid',
          message: exclude.msg,
        };
      } else {
        // valid
        addressValidationState = {
          type: 'valid',
        };
      }
    } else {
      // invalid
      addressValue = undefined;
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
  showSuccessCheck
  validationState={addressValidationState}
  bind:value
  placeholder="ENS name or ETH address"
/>
