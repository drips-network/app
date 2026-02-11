<script lang="ts">
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { verifyUsdcTrustline, type TrustlineCheckResult } from '$lib/utils/wave/stellar';

  interface Props {
    value: string;
    isValid: boolean;
    disabled?: boolean;
  }

  let { value = $bindable(''), isValid = $bindable(false), disabled = false }: Props = $props();

  let touched = $state(false);
  let trustlineCheck = $state<TrustlineCheckResult | null>(null);
  let isCheckingTrustline = $state(false);
  let lastCheckedAddress = $state('');

  const STELLAR_ADDRESS_LENGTH = 56;
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  function isValidBase32(str: string): boolean {
    return str.split('').every((char) => BASE32_ALPHABET.includes(char));
  }

  function validateStellarAddressFormat(address: string): { valid: boolean; message?: string } {
    if (!address) {
      return { valid: false, message: 'Stellar address is required' };
    }
    if (!address.startsWith('G')) {
      return { valid: false, message: 'Stellar address must start with G' };
    }
    if (address.length !== STELLAR_ADDRESS_LENGTH) {
      return {
        valid: false,
        message: `Stellar address must be ${STELLAR_ADDRESS_LENGTH} characters`,
      };
    }
    if (!isValidBase32(address)) {
      return { valid: false, message: 'Invalid characters in Stellar address' };
    }
    return { valid: true };
  }

  let formatValidation = $derived(validateStellarAddressFormat(value));

  // Debounced trustline check when format is valid
  $effect(() => {
    if (formatValidation.valid && value !== lastCheckedAddress) {
      isCheckingTrustline = true;
      trustlineCheck = null;

      const addressToCheck = value;

      // Debounce the API call
      const timeoutId = setTimeout(async () => {
        try {
          const result = await verifyUsdcTrustline(addressToCheck);
          // Only update if the address hasn't changed
          if (addressToCheck === value) {
            trustlineCheck = result;
            lastCheckedAddress = addressToCheck;
          }
        } finally {
          if (addressToCheck === value) {
            isCheckingTrustline = false;
          }
        }
      }, 500);

      return () => clearTimeout(timeoutId);
    } else if (!formatValidation.valid) {
      // Reset trustline check when format becomes invalid
      trustlineCheck = null;
      isCheckingTrustline = false;
    }
  });

  // Overall validity: format is valid AND trustline check passed
  $effect(() => {
    isValid =
      formatValidation.valid &&
      trustlineCheck !== null &&
      trustlineCheck.exists &&
      trustlineCheck.isAuthorized;
  });

  let validationState: TextInputValidationState = $derived.by(() => {
    if (!touched && !value) {
      return { type: 'unvalidated' };
    }

    // First check format
    if (!formatValidation.valid) {
      if (touched) {
        return { type: 'invalid', message: formatValidation.message ?? 'Invalid address' };
      }
      return { type: 'unvalidated' };
    }

    // Format is valid, check trustline status
    if (isCheckingTrustline) {
      return { type: 'pending' };
    }

    if (trustlineCheck) {
      if (trustlineCheck.error) {
        return { type: 'invalid', message: trustlineCheck.error };
      }
      if (!trustlineCheck.exists) {
        return {
          type: 'invalid',
          message: 'USDC trustline not found. Enable it in your wallet first.',
        };
      }
      if (!trustlineCheck.isAuthorized) {
        return { type: 'invalid', message: 'USDC trustline is not authorized.' };
      }
      return { type: 'valid' };
    }

    // Waiting for trustline check
    return { type: 'pending' };
  });

  let showSuccessCheck = $derived(
    formatValidation.valid &&
      trustlineCheck !== null &&
      trustlineCheck.exists &&
      trustlineCheck.isAuthorized,
  );
</script>

<TextInput
  bind:value
  placeholder="G..."
  {validationState}
  {showSuccessCheck}
  {disabled}
  onblur={() => (touched = true)}
/>
