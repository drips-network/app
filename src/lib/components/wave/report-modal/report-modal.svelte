<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Flag from '$lib/components/icons/Flag.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import SuccessStep from '$lib/components/success-step/success-step.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import modal from '$lib/stores/modal';
  import ErrorModal from '$lib/components/error-modal/error-modal.svelte';
  import { authenticatedCall } from '$lib/utils/wave/call';

  interface Props {
    targetType: 'repo' | 'user' | 'issue';
    targetId: string;
  }

  let { targetType, targetId }: Props = $props();

  let reason = $state('');
  let loading = $state(false);
  let reasonFocussed = $state(false);

  const MIN_REASON_LENGTH = 20;
  const MAX_REASON_LENGTH = 2000;

  let reasonTooShort = $derived(reason.length < MIN_REASON_LENGTH);
  let reasonTooLong = $derived(reason.length > MAX_REASON_LENGTH);
  let reasonValid = $derived(!reasonTooShort && !reasonTooLong);

  let canSubmit = $derived(reasonValid);

  function showSuccess() {
    modal.show(SuccessStep, undefined, {
      message:
        'Thank you for submitting the report and helping us maintain a fair, inclusive Wave for everyone. Drips cannot respond individually to every report, but rest assured that reports are being reviewed thoroughly.',
      action: 'hide-modal',
      padding: true,
      confetti: false,
    });
  }

  async function handleSubmit() {
    loading = true;

    try {
      await authenticatedCall(undefined, '/api/reports', {
        method: 'POST',
        body: JSON.stringify({ targetType, targetId, reason }),
      });

      showSuccess();
    } catch (e) {
      if (e instanceof Error && e.message.includes('409')) {
        showSuccess();
      } else {
        modal.show(ErrorModal, undefined, {
          message: e instanceof Error ? e.message : 'An unexpected error occurred.',
        });
      }
    } finally {
      loading = false;
    }
  }
</script>

<div class="modal">
  <StandaloneFlowStepLayout
    headline="Report {targetType === 'user' ? 'user' : 'issue'}"
    description="Why are you reporting this {targetType === 'user'
      ? 'user'
      : 'issue'}? Please explain in detail."
  >
    <div class="fields">
      <FormField
        title="Reason*"
        type="div"
        validationState={reasonValid
          ? { type: 'valid' }
          : reasonFocussed
            ? {
                type: 'invalid',
                message: reasonTooShort
                  ? `Reason must be at least ${MIN_REASON_LENGTH} characters.`
                  : reasonTooLong
                    ? `Reason must not exceed ${MAX_REASON_LENGTH} characters.`
                    : 'This field is required.',
              }
            : { type: 'valid' }}
      >
        <TextArea
          bind:value={reason}
          placeholder="Please describe what you're reporting and why..."
          onblur={() => (reasonFocussed = true)}
        />
        <div class="char-count">
          <span class:too-long={reasonTooLong} class="tnum"
            >{reason.length} / {MAX_REASON_LENGTH}</span
          >
        </div>
      </FormField>
    </div>

    {#snippet actions()}
      <Button variant="normal" disabled={loading} onclick={modal.hide}>Cancel</Button>
      <Button
        variant="destructive"
        icon={Flag}
        {loading}
        disabled={!canSubmit}
        onclick={handleSubmit}
      >
        Submit report
      </Button>
    {/snippet}
  </StandaloneFlowStepLayout>
</div>

<style>
  .modal {
    padding: 1rem;
  }

  .fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .char-count {
    font-size: 0.75rem;
    color: var(--color-foreground-level-5);
    text-align: right;
    margin-top: 0.25rem;
  }

  .too-long {
    color: var(--color-negative);
  }
</style>
