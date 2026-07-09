<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowReply from '$lib/components/icons/ArrowReply.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { appealWaveProgramRepo } from '$lib/utils/wave/wavePrograms';
  import FlowStepWrapper from '../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  let context = $derived(data.context);
  let appeal = $derived(context.appeal);

  const DASHBOARD_HREF = '/wave/maintainers/repos?status=rejected';

  // Whole days from now until `date`, rounded up (never negative).
  function daysUntil(date: Date): number {
    const ms = date.getTime() - Date.now();
    return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
  }

  // Why an appeal can't be submitted right now, or null when it can.
  let ineligibleReason = $derived.by<string | null>(() => {
    if (context.status !== 'rejected') {
      return 'This application isn’t rejected, so there’s nothing to appeal.';
    }
    if (appeal.canAppeal) return null;
    if (appeal.latestAppealStatus === 'pending') {
      return 'Your appeal is currently pending review. You’ll be able to appeal again only if it’s dismissed.';
    }
    if (appeal.appealsRemaining <= 0) {
      return 'You’ve used all appeals available for this repository.';
    }
    if (appeal.nextAppealAllowedAt) {
      const days = daysUntil(appeal.nextAppealAllowedAt);
      if (days > 0) {
        return `You can submit an appeal in ${days} day${days === 1 ? '' : 's'}.`;
      }
    }
    return 'You can’t appeal this rejection right now.';
  });

  let developmentWork = $state('');
  let developmentWorkFocussed = $state(false);

  const MIN_LENGTH = 20;
  const MAX_LENGTH = 10000;

  let tooShort = $derived(developmentWork.trim().length < MIN_LENGTH);
  let tooLong = $derived(developmentWork.length > MAX_LENGTH);
  let valid = $derived(!tooShort && !tooLong);

  let submitting = $state(false);
  let submittedSuccessfully = $state(false);

  let hasUnsavedChanges = $derived(developmentWork.length > 0);

  beforeNavigate((navigation) => {
    if (hasUnsavedChanges && !submittedSuccessfully) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigation.cancel();
      }
    }
  });

  async function handleSubmit() {
    submitting = true;
    try {
      await doWithErrorModal(async () => {
        await appealWaveProgramRepo(undefined, context.waveProgramId, context.orgRepoId, {
          developmentWorkSinceRejection: developmentWork.trim(),
        });
      });
      submittedSuccessfully = true;
      goto(`/wave/appeal/${context.waveProgramId}/${context.orgRepoId}/success`);
    } finally {
      submitting = false;
    }
  }
</script>

<FlowStepWrapper
  headline="Appeal rejection"
  description="Appeal the rejection of {context.repo
    .gitHubRepoFullName}. Our team will review your appeal and get back to you."
>
  {#if data.user?.restricted}
    <AnnotationBox type="error">
      Sorry, but your Drips Wave account has been restricted from submitting appeals. You can reach
      out to support@drips.network for more details.
      {#snippet actions()}
        <Button href="mailto:support@drips.network">Contact support</Button>
      {/snippet}
    </AnnotationBox>
  {:else if ineligibleReason}
    <AnnotationBox type="info">
      {ineligibleReason}
    </AnnotationBox>
  {:else}
    <AnnotationBox type="warning">
      Appeals are only reconsidered when there's been substantive work since the rejection —
      meaningful improvements to the code, project quality, activity, or the concerns raised in the
      review. If nothing material has changed, the decision won't change, and you'll use up one of
      your limited appeals.
    </AnnotationBox>
    <AnnotationBox type="info">
      You have <strong
        >{appeal.appealsRemaining} appeal{appeal.appealsRemaining === 1 ? '' : 's'} remaining</strong
      > for this repository. If this appeal is dismissed, you'll need to wait 1 month before you can
      appeal again.
    </AnnotationBox>
    <FormField
      title="What development work / improvements have you made since the repo was initially rejected?*"
      type="div"
      validationState={valid
        ? { type: 'valid' }
        : developmentWorkFocussed
          ? {
              type: 'invalid',
              message: tooShort
                ? `Please provide at least ${MIN_LENGTH} characters.`
                : `Please keep this under ${MAX_LENGTH.toLocaleString()} characters.`,
            }
          : { type: 'valid' }}
    >
      <TextArea
        bind:value={developmentWork}
        placeholder="Describe the changes and improvements you've made to address the reasons for the rejection…"
        onblur={() => (developmentWorkFocussed = true)}
      />
      <div class="char-count">
        <span class:too-long={tooLong} class="tnum"
          >{developmentWork.length.toLocaleString()} / {MAX_LENGTH.toLocaleString()}</span
        >
      </div>
    </FormField>
  {/if}

  {#snippet leftActions()}
    <Button icon={ArrowLeft} href={DASHBOARD_HREF}>Back to dashboard</Button>
  {/snippet}

  {#snippet actions()}
    {#if !data.user?.restricted && !ineligibleReason}
      <Button
        variant="primary"
        icon={ArrowReply}
        disabled={!valid}
        loading={submitting}
        onclick={handleSubmit}>Submit appeal</Button
      >
    {/if}
  {/snippet}
</FlowStepWrapper>

<style>
  .char-count {
    font-size: 0.875rem;
    color: var(--color-foreground-level-6);
    text-align: right;
    margin-top: 0.25rem;
  }

  .char-count .too-long {
    color: var(--color-negative);
  }
</style>
