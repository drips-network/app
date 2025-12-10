<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
  import IssuePreviewCard from '$lib/components/wave/issue-preview-card/issue-preview-card.svelte';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import { COMPLIMENT_TYPES, ComplimentType } from '$lib/utils/wave/types/compliment';
  import Card from '$lib/components/wave/card/card.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import { makeCompliment } from '$lib/utils/wave/compliments';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';

  let { data } = $props();
  const { canMakeCompliment, complimentDeadline, reason, previousCompliments } = data;

  let submitting = $state(false);

  let compliments: Items = $derived(
    Object.fromEntries(
      Object.values(ComplimentType).map((type) => [
        type,
        {
          type: 'selectable',
          label: COMPLIMENT_TYPES[type].label,
          text: `${COMPLIMENT_TYPES[type].points} Points`,
          value: type,
          disabled: previousCompliments?.compliments.some((c) => c.complimentType === type),
        },
      ]),
    ),
  );

  let selected = $state<ComplimentType[]>([]);

  async function handleSubmit() {
    submitting = true;

    try {
      await doWithErrorModal(
        async () =>
          await makeCompliment(
            undefined,
            data.wave.id,
            data.issue.id,
            selected.map((type) => ({ type })),
          ),
      );

      await goto(`/wave/${data.wave.id}/issues/${data.issue.id}/compliments/success`);
    } finally {
      submitting = false;
      selected = [];

      await invalidate('wave:issues');
    }
  }

  let valid = $derived(canMakeCompliment && selected.length > 0);
</script>

<HeadMeta
  title="Make a compliment | {data.issue.title} | {data.wave.name} Wave"
  description="Make a compliment on this issue in the {data.wave.name} Wave."
/>

<FlowStepWrapper
  headline="Make a compliment"
  description="Submit your compliment for this issue in the {data.wave.name} Wave."
>
  <FormField title="Issue*" type="div">
    <IssuePreviewCard issue={data.issue} />
  </FormField>

  {#if canMakeCompliment}
    <AnnotationBox type="info">
      By making a compliment, you'll reward the applicant that resolved the issue with additional
      points for their outstanding work. You can make compliments within seven days after the Wave
      Cycle that the issue has been resolved in has ended.
    </AnnotationBox>
  {:else if reason === 'not-completed'}
    <AnnotationBox type="warning">
      This issue has not been completed as part of a Wave Cycle, so a compliment cannot be made at
      this time.
    </AnnotationBox>
  {:else if reason === 'deadline-passed'}
    <AnnotationBox type="warning">
      The deadline to make a compliment for this issue has passed (
      {new Date(complimentDeadline!).toLocaleDateString()}). Compliments can be made within seven
      days after the Wave Cycle that the issue has been resolved in has ended.
    </AnnotationBox>
  {:else if reason === 'not-maintainer'}
    <AnnotationBox type="warning">
      Only members of the org the issue is from can make compliments on issues.
    </AnnotationBox>
  {/if}

  <FormField title="Compliment type*" type="div" disabled={!canMakeCompliment}>
    <Card style="padding: 0; text-align: left; width: 100%;">
      <ListSelect multiselect searchable={false} items={compliments} bind:selected />
    </Card>
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
