<script lang="ts">
  import { run } from 'svelte/legacy';

  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ens from '$lib/stores/ens';
  import { ethers } from 'ethers';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { createEventDispatcher } from 'svelte';
  import { BASE_URL } from '$lib/utils/base-url';
  import assert from '$lib/utils/assert';
  import { extractDriverNameFromAccountId } from '$lib/utils/sdk/utils/extract-driver-from-accountId';

  type ExclusionGroup = {
    addresses: (string | undefined)[];
    msg: string;
  };

  interface Props {
    value?: string | undefined;
    validatedValue?: string | undefined;
    exclude?: ExclusionGroup[];
  }

  let {
    value = $bindable(),
    validatedValue = $bindable(),
    exclude = [{ addresses: [], msg: 'You cannot use this address.' }],
  }: Props = $props();

  const dispatch = createEventDispatcher();

  let inputValidationState: TextInputValidationState = $state({ type: 'unvalidated' });

  // Incremented on every validation, so that results of a stale async validation
  // (e.g. a slow ENS lookup for a previous input) are discarded.
  let validationRun = 0;

  async function validateInput(input: string | undefined) {
    const thisRun = ++validationRun;

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
        validatedValue = undefined;
        inputValidationState = {
          type: 'invalid',
          message: 'Invalid Drip List URL',
        };

        return;
      }

      if (dripListId) {
        // Keep the user's input (the Drip List URL) as-is and only expose the resolved
        // account ID via `validatedValue`. Overwriting `value` with the raw account ID
        // caused the field to be re-validated as invalid on the next update.
        validatedValue = dripListId;

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
    } else if (input.endsWith('.eth')) {
      // lookup ENS
      inputValidationState = {
        type: 'pending',
      };

      const address = await ens.reverseLookup(input);

      if (thisRun !== validationRun) return;

      if (address) {
        validatedValue = address;

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
        message: `Enter a valid Ethereum address, ENS name, or Drip List URL.`,
      };
    }
  }

  // ensure initial value is validated since validateInput() is async
  if (value?.length) {
    validateInput(value).then(() => dispatch('validationChange', inputValidationState));
  }

  // `value` may be bound to a store property, in which case this effect re-runs whenever
  // *any* field of that store changes. Only re-validate when the input itself (or the
  // exclusion list it is validated against) changed, so that editing other fields of the
  // form doesn't re-trigger validation (or ENS lookups).
  // `exclude` is compared by content, since callers may pass a new array literal on every
  // update.
  let lastValidated: { input: string | undefined; excludeKey: string } | undefined;
  run(() => {
    const input = value;
    const excludeKey = JSON.stringify(exclude);

    if (lastValidated && lastValidated.input === input && lastValidated.excludeKey === excludeKey) {
      return;
    }
    lastValidated = { input, excludeKey };

    validateInput(input);
  });
  run(() => {
    dispatch('validationChange', inputValidationState);
  });
</script>

<TextInput
  autocomplete
  autocapitalize={false}
  autocorrect={false}
  showSuccessCheck
  validationState={inputValidationState}
  bind:value
  placeholder="Ethereum address, ENS name, or Drip List URL"
/>
