<script lang="ts">
  import { invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { createKycRequestForApplication } from '$lib/utils/rpgf/rpgf';
  import { createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';
  import type { State } from './create-rpgf-kyc-request-flow';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    applicationId: string;
    context: Writable<State>;
  }

  let { applicationId, context }: Props = $props();

  let verificationType: 'individual' | 'business' = $state('individual');
  let companyNameInput = $state('');
  let firstNameInput = $state('');
  let lastNameInput = $state('');
  let emailInput = $state('');

  async function createKyc() {
    dispatch('await', {
      message: 'Starting KYC with Fern...',

      promise: async () => {
        const result = await createKycRequestForApplication(undefined, applicationId, {
          type: verificationType === 'individual' ? 'INDIVIDUAL' : 'BUSINESS',
          firstName: firstNameInput,
          lastName: lastNameInput,
          email: emailInput,
        });

        $context.kycFormUrl = result.kycFormUrl;

        await invalidate('rpgf:round:applications');
      },
    });
  }

  function validateName(name: string): TextInputValidationState {
    if (!name) {
      return {
        type: 'unvalidated',
      };
    } else if (name.length >= 2 && name.length <= 200) {
      return {
        type: 'valid',
      };
    } else {
      return {
        type: 'invalid',
        message: 'Name must be between 2 and 200 characters.',
      };
    }
  }

  function validateEmail(email: string): TextInputValidationState {
    if (!email) {
      return {
        type: 'unvalidated',
      };
    } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        type: 'valid',
      };
    } else {
      return {
        type: 'invalid',
        message: 'Please enter a valid email address.',
      };
    }
  }

  function validateCompanyName(name: string): TextInputValidationState {
    if (verificationType === 'individual') {
      return {
        type: 'valid',
      };
    } else if (!name) {
      return {
        type: 'unvalidated',
      };
    } else if (name.length >= 2 && name.length <= 200) {
      return {
        type: 'valid',
      };
    } else {
      return {
        type: 'invalid',
        message: 'Company name must be between 2 and 200 characters.',
      };
    }
  }

  let firstNameInputValidationState = $derived(validateName(firstNameInput));
  let lastNameInputValidationState = $derived(validateName(lastNameInput));
  let emailInputValidationState = $derived(validateEmail(emailInput));
  let companyNameInputValidationState = $derived(validateCompanyName(companyNameInput));

  let allValid = $derived(
    firstNameInputValidationState.type === 'valid' &&
      lastNameInputValidationState.type === 'valid' &&
      emailInputValidationState.type === 'valid' &&
      companyNameInputValidationState.type === 'valid',
  );
</script>

<StandaloneFlowStepLayout
  headline="Start KYC verification"
  description="Please fill out the following information to begin the KYC verification process."
>
  <AnnotationBox>
    Drips will forward this information to our third-party KYC Provider Fern Money, LLC in
    accordance with our privacy policy. After submission of this form, we will provide you with a
    KYC form link where you can submit your identity documents directly to Fern Money, LLC. Drips
    does not store or process any of your identity documents.
  </AnnotationBox>

  <FormField
    title="Verification type*"
    description="Choose whether you are applying as an individual or on behalf of a company."
    type="div"
  >
    <div style:width="fit-content">
      <SegmentedControl
        bind:active={verificationType}
        options={[
          {
            title: 'Individual',
            value: 'individual',
          },
          {
            title: 'Business',
            value: 'business',
          },
        ]}
      />
    </div>
  </FormField>

  <FormField
    title="Email address*"
    description="For KYC purposes only. Fern may contact you to request additional information if necessary."
  >
    <TextInput
      bind:value={emailInput}
      placeholder="foo@bar.com"
      validationState={emailInputValidationState}
    />
  </FormField>

  <FormField title="Legal first name*" description="This must match your government-issued ID.">
    <TextInput
      bind:value={firstNameInput}
      placeholder="Fogell"
      validationState={firstNameInputValidationState}
    />
  </FormField>

  <FormField title="Legal last name*" description="This must match your government-issued ID.">
    <TextInput
      bind:value={lastNameInput}
      placeholder="McLovin"
      validationState={lastNameInputValidationState}
    />
  </FormField>

  <FormField
    title="Company name"
    description="The legal registration name of your company, if applicable."
    disabled={verificationType === 'individual'}
  >
    <TextInput
      bind:value={companyNameInput}
      placeholder="Acme Corp."
      disabled={verificationType === 'individual'}
      validationState={companyNameInputValidationState}
    />
  </FormField>

  {#snippet actions()}
    <Button variant="primary" icon={ArrowRight} onclick={createKyc} disabled={!allValid}
      >Confirm and continue</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>
