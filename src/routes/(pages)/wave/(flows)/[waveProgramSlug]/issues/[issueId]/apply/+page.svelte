<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Proposals from '$lib/components/icons/Proposals.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { applyToWorkOnIssue } from '$lib/utils/wave/issues';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import type { Snapshot } from './$types.js';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import formatDate from '$lib/utils/format-date';
  import Email from '$lib/components/icons/Email.svelte';
  import Discord from '$lib/components/icons/Discord.svelte';
  import Turnstile from '$lib/components/turnstile/turnstile.svelte';

  let { data } = $props();

  let applicationText = $state('');
  let turnstileToken = $state<string | undefined>(undefined);

  let textValid = $derived(applicationText.trim().length >= 10 && applicationText.length <= 2000);
  let valid = $derived(textValid && !!turnstileToken);

  let beenFocussed = $state(false);

  let tooShort = $derived(
    beenFocussed && applicationText.trim().length > 0 && applicationText.trim().length < 10,
  );
  let tooLong = $derived(applicationText.length > 2000);

  let waveProgramHasActiveWave = $derived(data.waves.pagination.total > 0);

  let submitting = $state(false);
  async function handleSubmit() {
    await doWithConfirmationModal(
      'Are you sure you want to submit this application? This will leave a comment on the GitHub issue in your name.',
      async () => {
        submitting = true;

        try {
          await doWithErrorModal(async () => {
            await applyToWorkOnIssue(
              undefined,
              data.waveProgram.id,
              data.issue.id,
              applicationText,
              turnstileToken,
            );

            await goto(`/wave/${data.waveProgram.slug}/issues/${data.issue.id}/apply/success`);
          });
        } finally {
          submitting = false;
        }
      },
    );
  }

  export const snapshot: Snapshot<string> = {
    capture: () => applicationText,
    restore: (value) => (applicationText = value),
  };
</script>

<HeadMeta
  title="Apply | {data.issue.title} | {data.waveProgram.name} Wave"
  description="Apply to work on this issue in the {data.waveProgram.name} Wave and get rewarded."
/>

<FlowStepWrapper
  headline="Apply to issue"
  description="Submit your application to work on this issue in the current {data.waveProgram
    .name} Wave."
>
  <FormField title="Issue*" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if data.alreadyApplied}
    <AnnotationBox>You already previously applied to this issue.</AnnotationBox>
  {:else if data.isOwnIssue}
    <AnnotationBox>
      You cannot apply to work on an issue in a repository you maintain. Please choose issues from
      other repositories.
    </AnnotationBox>
  {:else if data.issue.assignedApplicant}
    <AnnotationBox>
      This issue is already assigned to @{data.issue.assignedApplicant.gitHubUsername} in the current
      Wave. Please choose a different issue to apply to.
    </AnnotationBox>
  {:else if waveProgramHasActiveWave && data.applicationQuota?.remaining === 0}
    <AnnotationBox>
      You have used all {data.applicationQuota?.limit} of your application {data.applicationQuota
        ?.limit === 1
        ? 'slot'
        : 'slots'} in this Wave. Withdraw a pending application or wait for a decision before applying
      to another issue.
    </AnnotationBox>
  {:else if waveProgramHasActiveWave && data.orgAssignmentQuota?.remaining === 0}
    <AnnotationBox>
      <span class="typo-text-small-bold"
        >You have already been assigned {data.orgAssignmentQuota?.limit}
        {data.orgAssignmentQuota?.limit === 1 ? 'issue' : 'issues'} from {data.issue.repo.org
          .gitHubOrgLogin} in this Wave, which is the maximum allowed.</span
      >
      You can withdraw from a pending application to this organization if you'd like to apply to a different
      issue.

      {#snippet actions()}
        <Button
          href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#application-limits"
          target="_blank">Learn more</Button
        >
      {/snippet}
    </AnnotationBox>
  {:else if waveProgramHasActiveWave}
    <AnnotationBox type="info">
      <span class="typo-text-small-bold"
        >You have {data.applicationQuota?.remaining} of {data.applicationQuota?.limit} application {data
          .applicationQuota?.limit === 1
          ? 'slot'
          : 'slots'} remaining in this Wave.</span
      >
      You can free up more slots by resolving assigned issues or withdrawing pending applications.

      {#snippet actions()}
        <Button
          href="https://docs.drips.network/wave/contributors/solving-issues-and-earning-rewards#application-limits"
          target="_blank">Learn more</Button
        >
      {/snippet}
    </AnnotationBox>
    <FormField
      title="Application Text*"
      description="Explain why you'd like to work on this issue and list any relevant experience."
      type="div"
      validationState={textValid
        ? { type: 'valid' }
        : beenFocussed
          ? {
              type: 'invalid',
              message: tooShort
                ? 'Application must be at least 10 characters.'
                : tooLong
                  ? 'Application must not exceed 2000 characters.'
                  : 'This field is required.',
            }
          : { type: 'valid' }}
    >
      <TextArea
        bind:value={applicationText}
        placeholder="I would like to work on this issue because..."
        onblur={() => (beenFocussed = true)}
      />
      <div class="char-count">
        Markdown supported · Min 10 chars · <span class:too-long={tooLong} class="tnum"
          >{applicationText.length} / 2.000</span
        >
      </div>
    </FormField>
    <FormField
      title="Verification*"
      description="Confirm you're not a robot with a quick check."
      type="div"
    >
      <div class="turnstile-wrapper">
        <Turnstile ontoken={(t) => (turnstileToken = t)} />
      </div>
    </FormField>
  {:else}
    <AnnotationBox>
      {data.waveProgram.name} does not have an active Wave at the moment, so applications cannot be submitted.<br
      />
      {#if data.upcomingWave}
        The <a class="typo-link" href="/wave/{data.waveProgram.slug}"
          >next {data.waveProgram.name} Wave</a
        >
        starts on {formatDate(data.upcomingWave.startDate, 'onlyDay')}. Subscribe to our newsletter
        and join our Discord to be notified when it goes live!
      {:else}
        Consider subscribing to our newsletter and joining our Discord for announcements about
        upcoming Waves.
      {/if}

      {#snippet actions()}
        <Button icon={Email} href="/wave/newsletter">Subscribe to newsletter</Button>
        <Button icon={Discord} href="https://discord.gg/t8XBXZAEs5" target="_blank"
          >Join our Discord</Button
        >
      {/snippet}
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    <Button href={`/wave/${data.waveProgram.slug}/issues/${data.issue.id}`}
      >View issue details</Button
    >
  {/snippet}

  {#snippet actions()}
    {#if waveProgramHasActiveWave && !data.alreadyApplied && !data.isOwnIssue && !data.issue.assignedApplicant && (data.applicationQuota?.remaining ?? 0) > 0 && (data.orgAssignmentQuota?.remaining ?? 0) > 0}
      <Button
        loading={submitting}
        variant="primary"
        disabled={!valid}
        icon={Proposals}
        onclick={handleSubmit}>Apply to issue</Button
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

  .turnstile-wrapper {
    display: flex;
    justify-content: flex-start;
  }
</style>
