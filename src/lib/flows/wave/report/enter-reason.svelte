<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Flag from '$lib/components/icons/Flag.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import { authenticatedCall } from '$lib/utils/wave/call';
  import modal from '$lib/stores/modal';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  interface Props {
    targetType: 'repo' | 'user' | 'issue';
    targetId: string;
  }

  let { targetType, targetId }: Props = $props();

  let reason = $state('');
  let reasonFocussed = $state(false);

  const MIN_REASON_LENGTH = 20;
  const MAX_REASON_LENGTH = 2000;

  let reasonTooShort = $derived(reason.length < MIN_REASON_LENGTH);
  let reasonTooLong = $derived(reason.length > MAX_REASON_LENGTH);
  let reasonValid = $derived(!reasonTooShort && !reasonTooLong);

  let canSubmit = $derived(reasonValid);

  function handleSubmit() {
    dispatch('await', {
      message: 'Submitting report…',
      promise: async () => {
        try {
          await authenticatedCall(undefined, '/api/reports', {
            method: 'POST',
            body: JSON.stringify({ targetType, targetId, reason }),
          });
        } catch (e) {
          if (e instanceof Error && e.message.includes('409')) {
            // Already reported, treat as success
            return;
          }
          throw e;
        }
      },
    });
  }
</script>

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
    <Button variant="normal" onclick={modal.hide}>Cancel</Button>
    <Button variant="destructive" icon={Flag} disabled={!canSubmit} onclick={handleSubmit}>
      Submit report
    </Button>
  {/snippet}
</StandaloneFlowStepLayout>

<style>
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
