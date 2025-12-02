<script lang="ts">
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import RpgfApplicationEditor from '$lib/components/rpgf-application-editor/rpgf-application-editor.svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import submitRpgfApplicationFlowSteps from '$lib/flows/submit-rpgf-application/submit-rpgf-application-flow-steps.js';
  import modal from '$lib/stores/modal/index.js';
  import type { CreateApplicationDto } from '$lib/utils/rpgf/types/application';
  import unreachable from '$lib/utils/unreachable';
  import type { ComponentProps } from 'svelte';
  import assert from '$lib/utils/assert';

  let { data } = $props();
  let round = $derived(data.round);

  function mapAnswersToDto(
    answers: typeof data.application.latestVersion.answers,
  ): CreateApplicationDto['answers'] {
    return answers.map((answer) => {
      switch (answer.type) {
        case 'textarea':
        case 'text':
          return { fieldId: answer.fieldId, value: answer.text };
        case 'email':
          return { fieldId: answer.fieldId, value: answer.email };
        case 'url':
          return { fieldId: answer.fieldId, value: answer.url };
        case 'select':
          return { fieldId: answer.fieldId, value: answer.selected };
        case 'list':
          return { fieldId: answer.fieldId, value: answer.entries };
      }
      // awkward type cast but tbh i can not be arsed right now
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }) as any as CreateApplicationDto['answers'];
  }

  let readyToSubmit = $state(false);
  let formValue: ComponentProps<typeof RpgfApplicationEditor>['value'] = $state();

  function handleSubmit() {
    if (!formValue) return;

    const { projectName, categoryId, categoryName, fields, dripsAccountId, answers } = formValue;

    assert(round.name);

    modal.show(
      Stepper,
      undefined,
      submitRpgfApplicationFlowSteps(
        {
          projectName,
          dripsAccountId,
          answers,
          categoryId,
        },
        round.name,
        categoryName,
        fields,
        round.urlSlug ?? unreachable(),
        round.id,
        data.rpgfUserData?.userId ?? unreachable(),
        data.application,
      ),
    );
  }
</script>

<div class="page">
  <Button
    icon={ArrowLeft}
    href={`/app/rpgf/rounds/${data.round.urlSlug}/applications/${data.application.id}`}
  >
    Cancel and go back
  </Button>

  <h1>Edit application</h1>

  <p>
    <AnnotationBox type="warning">
      Editing your application will reset its state back to "Pending", and an admin will need to
      re-review it.

      <!-- TODO(rpgf): Add learn more link -->
    </AnnotationBox>
  </p>

  <RpgfApplicationEditor
    round={data.round}
    userId={data.rpgfUserData?.userId ?? unreachable()}
    categories={data.categories}
    applicationForms={data.applicationForms}
    projects={data.projects}
    preselectedCategoryId={data.application.latestVersion.category.id}
    preselectedDripsAccountId={data.application.latestVersion.dripsAccountId}
    prefilledAnswers={mapAnswersToDto(data.application.latestVersion.answers)}
    prefilledProjectName={data.application.latestVersion.projectName}
    bind:readyToSubmit
    bind:value={formValue}
    noPersistance
  />

  <Button
    icon={Wallet}
    disabled={!readyToSubmit}
    onclick={handleSubmit}
    variant="primary"
    size="large"
  >
    Confirm application edits
  </Button>
</div>

<style>
  .page {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 3rem;
    max-width: 55rem;
    margin: 0 auto;
  }
</style>
