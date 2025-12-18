<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { COMPLIMENT_TYPES, ComplimentType } from '$lib/utils/wave/types/compliment';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { makeCompliment } from '$lib/utils/wave/compliments';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import ComplimentCard from '$lib/components/wave/compliment-card/compliment-card.svelte';

  let { data } = $props();
  let { canMakeCompliment, complimentDeadline, reason, previousCompliments } = $derived(data);

  let submitting = $state(false);

  let selected = $state<ComplimentType[]>([]);

  async function handleSubmit() {
    submitting = true;

    try {
      await doWithErrorModal(
        async () =>
          await makeCompliment(
            undefined,
            data.waveProgram.id,
            data.issue.id,
            selected.map((type) => ({ type })),
          ),
      );

      await goto(`/wave/${data.waveProgram.slug}/issues/${data.issue.id}/compliments/success`);
    } finally {
      submitting = false;
      selected = [];

      await invalidate('wave:issues');
    }
  }

  let valid = $derived(canMakeCompliment && selected.length > 0);
</script>

<HeadMeta
  title="Give a compliment | {data.issue.title} | {data.waveProgram.name} Wave"
  description="Give a compliment on this issue in the {data.waveProgram.name} Wave."
/>

<FlowStepWrapper
  headline="Give a compliment"
  description="Submit your compliment for this issue in the {data.waveProgram.name} Wave."
>
  <FormField title="Issue*" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if canMakeCompliment}
    <AnnotationBox type="info">
      By making a compliment, you'll reward the applicant that resolved the issue with additional
      points for their outstanding work. You can give compliments within seven days after the Wave
      that the issue has been resolved in has ended.
    </AnnotationBox>
  {:else if reason === 'not-completed'}
    <AnnotationBox type="warning">
      This issue has not been completed as part of a Wave, so a compliment cannot be made at this
      time.
    </AnnotationBox>
  {:else if reason === 'deadline-passed'}
    <AnnotationBox type="warning">
      The deadline to give a compliment for this issue has passed (
      {new Date(complimentDeadline!).toLocaleDateString()}). Compliments can be made within seven
      days after the Wave that the issue has been resolved in has ended.
    </AnnotationBox>
  {:else if reason === 'not-maintainer'}
    <AnnotationBox type="warning">
      Only members of the org the issue is from can give compliments on issues.
    </AnnotationBox>
  {/if}

  <FormField
    title="Compliments to give*"
    description="Each compliment can be given once per issue."
    type="div"
    disabled={!canMakeCompliment}
  >
    <div class="compliments-grid">
      {#each Object.values(ComplimentType) as type (type)}
        {@const { label: title, points, illustration } = COMPLIMENT_TYPES[type]}
        {@const disabled = Boolean(
          previousCompliments?.compliments.find((c) => c.complimentType === type),
        )}
        <label class:selected={selected.includes(type)} for={type} class:disabled>
          <input
            type="checkbox"
            checked={selected.includes(type)}
            oninput={(e) => {
              if (e.currentTarget.checked) {
                selected = [...selected, type];
              } else {
                selected = selected.filter((t) => t !== type);
              }
            }}
            id={type}
            value={type}
            {disabled}
          />
          <ComplimentCard {title} {illustration} {points} />
        </label>
      {/each}
    </div>
  </FormField>

  {#snippet leftActions()}
    <Button href={`/wave/maintainers/issues/${data.issue.id}`}>View issue details</Button>
  {/snippet}

  {#snippet actions()}
    <Button
      loading={submitting}
      variant="primary"
      disabled={!valid}
      icon={CheckCircle}
      onclick={handleSubmit}>Submit compliments</Button
    >
  {/snippet}
</FlowStepWrapper>

<style>
  .compliments-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
    gap: 1rem;
  }

  .compliments-grid label {
    transform: scale(0.95);
    opacity: 0.7;
    transition:
      transform 0.2s ease,
      opacity 0.2s ease;
    cursor: pointer;
    filter: grayscale(0.5);
  }

  .compliments-grid input {
    /* Remove display: none so the browser "sees" it */
    opacity: 0;
    position: absolute;
    width: 0;
    height: 0;
    /* Ensure it doesn't mess with layout */
    margin: 0;
    pointer-events: none;
  }

  .compliments-grid label.disabled {
    pointer-events: none;
    opacity: 0.25;
    cursor: default;
    filter: grayscale(1);
  }

  .compliments-grid label:hover:not(.selected):not(.disabled),
  .compliments-grid label:focus-within:not(.selected):not(.disabled) {
    filter: grayscale(0.25);
    opacity: 0.8;
  }

  .compliments-grid label.selected {
    transform: scale(1);
    opacity: 1;
    filter: grayscale(0);
  }
</style>
