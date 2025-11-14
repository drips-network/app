<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import modal from '$lib/stores/modal/index.js';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import { tick, type ComponentProps } from 'svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import submitRpgfApplicationFlowSteps from '$lib/flows/submit-rpgf-application/submit-rpgf-application-flow-steps.js';
  import assert from '$lib/utils/assert';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import RpgfApplicationEditor from '$lib/components/rpgf-application-editor/rpgf-application-editor.svelte';
  import unreachable from '$lib/utils/unreachable.js';

  let { data } = $props();
  let round = $derived(data.round);

  let readyToSubmit = $state(false);
  let formValue: ComponentProps<typeof RpgfApplicationEditor>['value'] = $state();

  async function handleSubmit() {
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
        null,
      ),
    );
  }

  let forceRevealAllErrors = $state(false);
</script>

<HeadMeta title="Apply to {round.name}" />

<div class="page">
  <Button icon={ArrowLeft} href={`/app/rpgf/rounds/${round.urlSlug}`}>Back to round</Button>
  {#if round.state === 'intake'}
    <h1>Apply to {round.name}</h1>

    <p>
      To apply to this round, first pick one of your existing GitHub repositories claimed on Drips.
      If you haven't claimed your repository yet, click "Claim new project" below and follow the
      instructions. Any rewards from the round will be distributed to your selected Drips project. <a
        class="typo-link"
        href="https://docs.drips.network/rpgf/apply-to-a-round#before-you-apply-your-drips-project"
        target="_blank">Learn more</a
      >
    </p>

    <RpgfApplicationEditor
      {round}
      forceRevealErrors={forceRevealAllErrors}
      userId={data.rpgfUserData?.userId ?? unreachable()}
      categories={data.categories}
      applicationForms={data.applicationForms}
      projects={data.projects}
      bind:value={formValue}
      bind:readyToSubmit
    />

    <div style:align-self="flex-end" style:display="flex" style:flex-wrap="wrap" style:gap="1rem">
      {#if !readyToSubmit}
        <AnnotationBox type="error">
          Some fields are invalid or missing.
          {#snippet actions()}
                  
              <Button
                variant="normal"
                onclick={async () => {
                  forceRevealAllErrors = true;

                  // wait for the DOM to update before scrolling
                  await tick();

                  const errorAnchor = document.getElementById('form-field-validation-error-anchor');
                  if (errorAnchor) {
                    errorAnchor.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }
                }}
              >
                Show all errors
              </Button>
            
                  {/snippet}
        </AnnotationBox>
      {/if}

      <Button
        icon={Wallet}
        disabled={!readyToSubmit}
        onclick={handleSubmit}
        variant="primary"
        size="large"
      >
        Submit application
      </Button>
    </div>
  {/if}
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
