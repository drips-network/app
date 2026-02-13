<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import StarRating from '$lib/components/star-rating/star-rating.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import GithubUserBadge from '$lib/components/wave/github-user-badge/github-user-badge.svelte';
  import UserAvatar from '$lib/components/user-avatar/user-avatar.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { submitReview } from '$lib/utils/wave/reviews';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import type { OverallExperience, ReviewPayload } from '$lib/utils/wave/types/review';

  let { data } = $props();

  let submitting = $state(false);

  let overallExperience = $state<OverallExperience | null>(
    data.canReview && data.existingReview ? data.existingReview.overallExperience : null,
  );

  let communicationQuality = $state<number>(
    data.canReview && data.existingReview ? (data.existingReview.communicationQuality ?? 0) : 0,
  );

  let timeliness = $state<number>(
    data.canReview && data.existingReview ? (data.existingReview.timeliness ?? 0) : 0,
  );

  let comment = $state<string>(
    data.canReview && data.existingReview ? (data.existingReview.comment ?? '') : '',
  );

  // Maintainer-specific
  let codeQuality = $state<number>(
    data.canReview && data.existingReview && data.existingReview.reviewerRole === 'maintainer'
      ? (data.existingReview.codeQuality ?? 0)
      : 0,
  );
  let problemSolving = $state<number>(
    data.canReview && data.existingReview && data.existingReview.reviewerRole === 'maintainer'
      ? (data.existingReview.problemSolving ?? 0)
      : 0,
  );

  // Contributor-specific
  let issueClarity = $state<number>(
    data.canReview && data.existingReview && data.existingReview.reviewerRole === 'contributor'
      ? (data.existingReview.issueClarity ?? 0)
      : 0,
  );
  let repoCodeQuality = $state<number>(
    data.canReview && data.existingReview && data.existingReview.reviewerRole === 'contributor'
      ? (data.existingReview.repoCodeQuality ?? 0)
      : 0,
  );

  const EXPERIENCE_OPTIONS: Array<{ label: string; value: OverallExperience }> = [
    { label: 'Below expectations', value: 'below_expectations' },
    { label: 'Alright', value: 'alright' },
    { label: 'Exceeded expectations', value: 'exceeded_expectations' },
  ];

  let valid = $derived(data.canReview && overallExperience !== null);

  async function handleSubmit() {
    if (!data.canReview || !overallExperience) return;

    submitting = true;

    try {
      let payload: ReviewPayload;

      if (data.reviewerRole === 'maintainer') {
        payload = {
          reviewerRole: 'maintainer',
          overallExperience,
          ...(communicationQuality > 0 ? { communicationQuality } : {}),
          ...(codeQuality > 0 ? { codeQuality } : {}),
          ...(timeliness > 0 ? { timeliness } : {}),
          ...(problemSolving > 0 ? { problemSolving } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        };
      } else {
        payload = {
          reviewerRole: 'contributor',
          overallExperience,
          ...(communicationQuality > 0 ? { communicationQuality } : {}),
          ...(issueClarity > 0 ? { issueClarity } : {}),
          ...(repoCodeQuality > 0 ? { repoCodeQuality } : {}),
          ...(timeliness > 0 ? { timeliness } : {}),
          ...(comment.trim() ? { comment: comment.trim() } : {}),
        };
      }

      await doWithErrorModal(
        async () => await submitReview(undefined, data.waveProgram.id, data.issue.id, payload),
      );

      await goto(`/wave/${data.waveProgram.slug}/issues/${data.issue.id}/review/success`);
    } finally {
      submitting = false;
      await invalidate('wave:issues');
    }
  }

  let isEditing = $derived(data.canReview && data.existingReview != null);
</script>

<HeadMeta
  title="Leave a review | {data.issue.title} | {data.waveProgram.name} Wave"
  description="Leave a review for this issue in the {data.waveProgram.name} Wave."
/>

<FlowStepWrapper
  headline="Review your experience"
  description={data.canReview
    ? data.reviewerRole === 'maintainer'
      ? `Rate your experience working with the contributor on this issue in the ${data.waveProgram.name} Wave.`
      : `Rate your experience working with the maintainer on this issue in the ${data.waveProgram.name} Wave.`
    : undefined}
>
  <FormField title="Issue" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if data.canReview && data.reviewerRole === 'maintainer' && data.issue.assignedApplicant}
    <FormField title="Contributor" type="div">
      <GithubUserBadge user={data.issue.assignedApplicant} />
    </FormField>
  {:else if data.canReview && data.reviewerRole === 'contributor'}
    <FormField title="Org" type="div">
      <div class="org-badge">
        <UserAvatar size={24} src={data.issue.repo.org.gitHubOrgAvatarUrl ?? undefined} />
        <span class="typo-text">{data.issue.repo.org.gitHubOrgLogin}</span>
      </div>
    </FormField>
  {/if}

  {#if data.canReview}
    <AnnotationBox type="info">
      Your review is anonymous. Maintainers and contributors will only receive an anonymous rating
      summary after the Wave. Please be honest and truthful.{#if data.reviewerRole === 'maintainer'}
        Members of {data.issue.repo.org.gitHubOrgLogin} will be able to view and re-submit this review.{/if}
    </AnnotationBox>

    <FormField
      title="Overall experience*"
      description="How was your overall experience {data.reviewerRole === 'maintainer'
        ? 'working with this contributor'
        : 'working on this issue'}?"
      type="div"
    >
      <div class="experience-options">
        {#each EXPERIENCE_OPTIONS as option (option.value)}
          <label
            class="experience-option typo-text"
            class:selected={overallExperience === option.value}
          >
            {option.label}
            <input
              type="radio"
              name="overallExperience"
              value={option.value}
              checked={overallExperience === option.value}
              onchange={() => (overallExperience = option.value)}
            />
          </label>
        {/each}
      </div>
    </FormField>

    {#if data.reviewerRole === 'maintainer'}
      <FormField
        title="Communication quality"
        description="How well did the contributor communicate progress, questions, and blockers?"
        type="div"
      >
        <StarRating value={communicationQuality} onchange={(v) => (communicationQuality = v)} />
      </FormField>

      <FormField
        title="Code quality"
        description="How clean, well-structured, and maintainable was the contributor's code?"
        type="div"
      >
        <StarRating value={codeQuality} onchange={(v) => (codeQuality = v)} />
      </FormField>

      <FormField
        title="Timeliness"
        description="How responsive was the contributor while working on this issue?"
        type="div"
      >
        <StarRating value={timeliness} onchange={(v) => (timeliness = v)} />
      </FormField>

      <FormField
        title="Problem solving"
        description="How well did the contributor handle challenges and find solutions independently?"
        type="div"
      >
        <StarRating value={problemSolving} onchange={(v) => (problemSolving = v)} />
      </FormField>
    {:else}
      <FormField
        title="Communication quality"
        description="How well did the maintainer communicate expectations, feedback, and decisions?"
        type="div"
      >
        <StarRating value={communicationQuality} onchange={(v) => (communicationQuality = v)} />
      </FormField>

      <FormField
        title="Issue clarity"
        description="How clear and well-defined was the issue description and its requirements?"
        type="div"
      >
        <StarRating value={issueClarity} onchange={(v) => (issueClarity = v)} />
      </FormField>

      <FormField
        title="Repo code quality"
        description="How well-organized and easy to work with was the repository's codebase?"
        type="div"
      >
        <StarRating value={repoCodeQuality} onchange={(v) => (repoCodeQuality = v)} />
      </FormField>

      <FormField
        title="Timeliness"
        description="How responsive was the maintainer when reviewing PRs and answering questions?"
        type="div"
      >
        <StarRating value={timeliness} onchange={(v) => (timeliness = v)} />
      </FormField>
    {/if}

    <FormField title="Comment" description="Share any additional thoughts or feedback." type="div">
      <TextArea
        value={comment}
        oninput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          comment = target.value.slice(0, 5000);
        }}
        placeholder="Any additional feedback..."
        caption="{comment.length}/5000"
      />
    </FormField>
  {:else if data.reason === 'not-completed'}
    <AnnotationBox type="warning">
      This issue hasn't been completed yet, so a review cannot be submitted at this time. Please
      wait until the issue is resolved.
    </AnnotationBox>
  {:else if data.reason === 'deadline-passed'}
    <AnnotationBox type="warning">
      The deadline to leave a review for this issue has passed ({data.reviewDeadline
        ? new Date(data.reviewDeadline).toLocaleDateString()
        : ''}). Reviews can be submitted within seven days after the Wave that the issue has been
      resolved in has ended.
    </AnnotationBox>
  {:else if data.reason === 'not-authorized'}
    <AnnotationBox type="warning">
      Only maintainer org members or the assigned contributor can leave a review.
    </AnnotationBox>
  {/if}

  {#snippet leftActions()}
    {#if data.canReview && data.reviewerRole === 'maintainer'}
      <Button href={`/wave/maintainers/issues/${data.issue.id}`}>View issue details</Button>
    {:else if data.canReview && data.reviewerRole === 'contributor'}
      <Button href={`/wave/contributors/issues/${data.issue.id}`}>View issue details</Button>
    {:else}
      <Button href={`/wave/${data.waveProgram.slug}/issues/${data.issue.id}`}
        >View issue details</Button
      >
    {/if}
  {/snippet}

  {#snippet actions()}
    <Button
      loading={submitting}
      variant="primary"
      disabled={!valid}
      icon={CheckCircle}
      onclick={handleSubmit}>{isEditing ? 'Update review' : 'Submit review'}</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .experience-options {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .experience-option {
    cursor: pointer;
    padding: 0.25rem 0.5rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-foreground-level-3);
    user-select: none;
    transition:
      border-color 0.3s,
      background-color 0.3s;
  }

  .experience-option:hover,
  .experience-option:focus-within {
    background-color: var(--color-foreground-level-2);
  }

  .experience-option.selected {
    background-color: var(--color-primary-level-1);
    border-color: var(--color-primary-level-3);
  }

  .experience-option input {
    display: none;
  }

  .org-badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
</style>
