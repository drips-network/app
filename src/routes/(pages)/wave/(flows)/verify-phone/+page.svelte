<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { requestPhoneVerification } from '$lib/utils/wave/users.js';
  import FlowStepWrapper from '../shared/flow-step-wrapper.svelte';
  import COUNTRIES from './countries';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { goto, invalidate } from '$app/navigation';
  import {
    AsYouType,
    getCountries,
    getCountryCallingCode,
    isSupportedCountry,
    type CountryCode,
  } from 'libphonenumber-js/mobile';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import ArrowBoxUpRight from '$lib/components/icons/ArrowBoxUpRight.svelte';
  import LockAndKeyEmoji from '$lib/components/icons/🔐.svelte';

  let { data } = $props();
  let { backTo } = $derived(data);

  let phoneNumber = $state('');
  let submitting = $state(false);
  let selectedCountryCode = $state<CountryCode | null>(null);

  async function submit() {
    submitting = true;

    await doWithErrorModal(
      async () => {
        if (selectedCountryCode === null) {
          throw new Error('No country selected');
        }

        const parsedNumber = parseNumber(phoneNumber, selectedCountryCode);

        if (!parsedNumber.isValid || !parsedNumber.number) {
          throw new Error('Invalid phone number');
        }

        await requestPhoneVerification(undefined, parsedNumber.number.number);

        await invalidate('wave:phone-verification-status');

        await goto(
          `/wave/verify-phone/enter-code?number=${encodeURIComponent(parsedNumber.number.number)}&backTo=${encodeURIComponent(backTo || '')}`,
        );
      },
      () => {
        submitting = false;
      },
    );
  }

  function parseNumber(input: string, countryCode: string) {
    if (!isSupportedCountry(countryCode)) {
      return {
        isValid: false,
        number: null,
      };
    }

    const asYouType = new AsYouType(countryCode);
    asYouType.input(input);
    return {
      isValid: asYouType.isPossible(),
      number: asYouType.getNumber(),
    };
  }

  let phoneValid = $derived.by(() => {
    if (selectedCountryCode === null) {
      return false;
    }

    const parsedNumber = parseNumber(phoneNumber, selectedCountryCode);

    if (!parsedNumber) {
      return false;
    }

    return parsedNumber.isValid;
  });

  let phoneInputValidationState = $derived.by<TextInputValidationState>(() => {
    if (phoneNumber.trim() === '') {
      return { type: 'unvalidated' };
    }

    return phoneValid
      ? { type: 'valid' }
      : { type: 'invalid', message: 'Please enter a valid phone number.' };
  });
</script>

<FlowStepWrapper
  icon={LockAndKeyEmoji}
  headline="Quick checkpoint"
  description="To help us keep the Wave fair and secure, please verify your phone number."
>
  <AnnotationBox type="info">
    Verifying a phone number helps us prevent cheating and abuse on the Wave platform. Phone numbers
    are used solely for account verification purposes, and we do not store them once successfully
    processed.

    {#snippet actions()}
      <Button
        href="https://docs.drips.network/wave/faq#why-do-i-need-to-verify-my-phone-number"
        target="_blank"
        icon={ArrowBoxUpRight}
      >
        Learn more
      </Button>
    {/snippet}
  </AnnotationBox>

  <FormField
    title="Country*"
    description="Select the country associated with your phone number."
    type="div"
  >
    <div class="list-wrapper">
      <ListSelect
        items={Object.fromEntries(
          mapFilterUndefined(getCountries(), (c) => {
            const country = COUNTRIES.find((country) => country.code === c);

            if (!country) {
              return undefined;
            }

            return [
              c,
              {
                type: 'selectable',
                label: `${country.flag} ${country.name}`,
                text: `+${getCountryCallingCode(c)}`,
              },
            ];
          }),
        )}
        onchange={(selected) => {
          const country = COUNTRIES.find((c) => c.code === selected[0]);

          if (!country) {
            selectedCountryCode = null;
            return;
          }

          if (!isSupportedCountry(country?.code)) {
            // fall back to "part of" if it's there
            if ('partOf' in country && isSupportedCountry(country.partOf[0])) {
              selectedCountryCode = country.partOf[0];
            } else {
              selectedCountryCode = null;
            }

            return;
          } else {
            selectedCountryCode = country.code;
          }
        }}
      />
    </div>
  </FormField>

  <FormField
    title="Mobile phone number*"
    description="Please enter your mobile phone number, capable of receiving SMS messages."
    disabled={selectedCountryCode === null}
  >
    <div class="tel-input">
      <span class="typo-text">
        {#if selectedCountryCode}
          +{getCountryCallingCode(selectedCountryCode)}
        {:else}
          +___
        {/if}
      </span>
      <TextInput
        bind:value={phoneNumber}
        placeholder="123 456 7890"
        variant={{ type: 'tel' }}
        disabled={submitting}
        validationState={phoneInputValidationState}
      />
    </div>
  </FormField>

  {#snippet actions()}
    <Button
      disabled={submitting || selectedCountryCode === null || phoneNumber.trim() === ''}
      loading={submitting}
      variant="primary"
      onclick={submit}
      icon={ArrowRight}>Send verification code</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .list-wrapper {
    height: 16rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }

  .tel-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
