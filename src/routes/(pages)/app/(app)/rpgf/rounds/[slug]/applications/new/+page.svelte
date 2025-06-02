<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Wallet from '$lib/components/icons/Wallet.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types.js';
  import ProjectBadge from '$lib/components/project-badge/project-badge.svelte';
  import DividerField from '$lib/components/rpgf-application-form/components/divider-field.svelte';
  import RpgfApplicationForm from '$lib/components/rpgf-application-form/rpgf-application-form.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input.js';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import modal from '$lib/stores/modal/index.js';
  import isClaimed from '$lib/utils/project/is-claimed.js';
  import { goto } from '$app/navigation';
  import storedWritable from '@efstajas/svelte-stored-writable';
  import { z } from 'zod';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal.js';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import { tick } from 'svelte';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import submitRpgfApplicationFlowSteps from '$lib/flows/submit-rpgf-application/submit-rpgf-application-flow-steps.js';
  import assert from '$lib/utils/assert';

  export let data;

  $: round = data.wrappedRound.round;
  $: projects = data.projects.filter((p) => isClaimed(p.chainData[0]));
  $: applicationFormat = round.applicationFormat;

  const fullFormData = storedWritable(
    `rpgf-form-data-${data.wrappedRound.round.urlSlug}`,
    z.object({
      projectName: z.string().min(1).max(255).optional(),
      dripsAccountId: z.string().min(1).optional(),

      fields: z.record(z.string(), z.any()),
    }),
    {
      projectName: undefined,
      dripsAccountId: undefined,
      fields: {},
    },
  );

  // On load, check if the form data has been restored from local storage.
  let formDataHasBeenRestored =
    $fullFormData.projectName !== undefined ||
    $fullFormData.dripsAccountId !== undefined ||
    Object.keys($fullFormData.fields).length > 0;

  let projectItems: Items;
  $: projectItems = {
    ...Object.fromEntries(
      projects.map((project) => {
        return [
          project.account.accountId,
          {
            type: 'selectable',
            label: {
              component: ProjectBadge,
              props: {
                project,
                tooltip: false,
                linkToNewTab: true,
              },
            },
            searchString: [...Object.values(project.source)],
          },
        ];
      }),
    ),
    // TODO(rpgf): Skip the network select screen, and don't link to new project at the end.
    // Instead, just close the modal and invalidate the load function.
    'claim-project': {
      type: 'action',
      label: 'Claim new project',
      image: {
        component: Plus,
        props: {},
      },
      handler: () =>
        modal.show(ClaimProjectStepper, undefined, {
          skipWalletConnect: true,
          linkToProjectPageOnSuccess: false,
        }),
    },
  };
  let projectPickerSelected: string[] = $fullFormData.dripsAccountId
    ? data.projects.find((p) => p.account.accountId === $fullFormData.dripsAccountId)
      ? [$fullFormData.dripsAccountId]
      : []
    : [];
  $: $fullFormData.dripsAccountId = projectPickerSelected[0];

  let nameAutofilled = Boolean($fullFormData.projectName);
  $: if ($fullFormData.dripsAccountId && !nameAutofilled) {
    $fullFormData.projectName =
      projects.find((p) => p.account.accountId === $fullFormData.dripsAccountId)?.source.repoName ||
      '';
    nameAutofilled = true;
  }

  let projectNameValidationState: TextInputValidationState = { type: 'unvalidated' };
  $: {
    if (!$fullFormData.dripsAccountId) {
      projectNameValidationState = { type: 'unvalidated' };
    } else if (
      $fullFormData.projectName &&
      $fullFormData.projectName.length > 0 &&
      $fullFormData.projectName.length <= 255
    ) {
      projectNameValidationState = { type: 'valid' };
    } else {
      projectNameValidationState = {
        type: 'invalid',
        message: 'Project name must be between 1 and 255 characters long.',
      };
    }
  }

  let formDataValid = false;

  $: readyToSubmit =
    formDataValid && projectNameValidationState.type === 'valid' && $fullFormData.dripsAccountId;

  async function handleSubmit() {
    const { dripsAccountId, fields, projectName } = $fullFormData;
    assert(projectName && dripsAccountId && fields, 'Not all form data is set');

    modal.show(
      Stepper,
      undefined,
      submitRpgfApplicationFlowSteps(
        {
          projectName,
          dripsAccountId,
          fields,
        },
        round.applicationFormat,
        round.urlSlug,
      ),
    );
  }

  let forceRevealAllErrors = formDataHasBeenRestored;
</script>

<div class="page">
  <Button
    icon={ArrowLeft}
    on:click={() => {
      goto(`/app/rpgf/rounds/${round.urlSlug}`);
    }}
  >
    Back to round
  </Button>
  {#if round.state === 'intake'}
    <h1>Apply to {round.name}</h1>

    {#if formDataHasBeenRestored}
      <div style:width="100%">
        <AnnotationBox>
          We restored a previously saved application draft for you.
          <svelte:fragment slot="actions">
            <Button
              variant="destructive"
              on:click={() => {
                doWithConfirmationModal(
                  'Are you sure you want to clear all fields? This action cannot be undone.',
                  () => {
                    fullFormData.clear();
                    formDataHasBeenRestored = false;
                    projectPickerSelected = [];
                    forceRevealAllErrors = false;
                  },
                );
              }}
            >
              Clear all fields
            </Button>
          </svelte:fragment>
        </AnnotationBox>
      </div>
    {/if}

    <p>
      To apply to this round, please first pick one of your existing GitHub repository claimed on
      Drips. If you haven't claimed your repository yet, click "Claim new project" below and follow
      the instructions. Any rewards from the round will be distributed directly to your selected
      project. <a
        class="typo-link"
        href="https://docs.drips.network/get-support/claim-your-repository"
        target="_blank">Learn more</a
      >
    </p>

    <FormField
      type="div"
      title="Drips project*"
      description="Select one of your claimed projects to apply to the round with."
    >
      <div class="project-picker">
        <ListSelect
          bind:selected={projectPickerSelected}
          searchable
          emptyStateText="You haven't claimed any projects yet."
          items={projectItems}
        />
      </div>
      <div slot="action">
        <Button
          icon={Plus}
          on:click={() =>
            modal.show(ClaimProjectStepper, undefined, {
              skipWalletConnect: true,
              linkToProjectPageOnSuccess: false,
            })}
        >
          Claim new project
        </Button>
      </div>
    </FormField>

    <FormField
      type="div"
      title="Application name*"
      description="Give your application a memorable name that describes it well."
      disabled={!$fullFormData.dripsAccountId}
    >
      <TextInput
        bind:value={$fullFormData.projectName}
        validationState={projectNameValidationState}
        disabled={!$fullFormData.dripsAccountId}
      />
    </FormField>

    <DividerField />

    <RpgfApplicationForm
      forceRevealErrors={forceRevealAllErrors}
      bind:valid={formDataValid}
      bind:data={$fullFormData.fields}
      disabled={!$fullFormData.dripsAccountId || projectNameValidationState.type !== 'valid'}
      {applicationFormat}
    />

    <div style:align-self="flex-end" style:display="flex" style:flex-wrap="wrap" style:gap="1rem">
      {#if !formDataValid}
        <AnnotationBox type="error">
          Some fields are invalid or missing.
          <svelte:fragment slot="actions">
            <Button
              variant="normal"
              on:click={async () => {
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
          </svelte:fragment>
        </AnnotationBox>
      {/if}

      <Button
        icon={Wallet}
        disabled={!readyToSubmit}
        on:click={handleSubmit}
        variant="primary"
        size="large"
      >
        Submit application
      </Button>
    </div>
  {:else}
    <!-- TODO(rpgf): Make this pretty -->
    <div class="flex flex-col items-center justify-center h-full">
      <h1 class="text-2xl font-bold">Applications for this round are not open</h1>
      <p class="text-lg"></p>
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

  .project-picker {
    min-height: 14rem;
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>
