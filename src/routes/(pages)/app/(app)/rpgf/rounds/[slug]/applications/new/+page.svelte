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
  import { submitApplication } from '$lib/utils/rpgf/rpgf';
  import assert from '$lib/utils/assert';
  import { goto, invalidateAll } from '$app/navigation';
  import doWithErrorModal from '$lib/utils/do-with-error-modal.js';

  export let data;

  $: round = data.wrappedRound.round;
  $: projects = data.projects.filter((p) => isClaimed(p.chainData[0]));
  $: applicationFormat = round.applicationFormat;

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
      handler: () => modal.show(ClaimProjectStepper, undefined, { skipWalletConnect: true }),
    },
  };
  let projectPickerSelected: string[] = [];
  $: selectedProject = projectPickerSelected[0];

  let projectName: string | undefined = undefined;
  let nameAutofilled = false;
  $: if (selectedProject && !nameAutofilled) {
    projectName =
      projects.find((p) => p.account.accountId === selectedProject)?.source.repoName || '';
    nameAutofilled = true;
  }

  let projectNameValidationState: TextInputValidationState = { type: 'unvalidated' };
  $: {
    if (!selectedProject) {
      projectNameValidationState = { type: 'unvalidated' };
    } else if (projectName && projectName.length > 0 && projectName.length <= 255) {
      projectNameValidationState = { type: 'valid' };
    } else {
      projectNameValidationState = {
        type: 'invalid',
        message: 'Project name must be between 1 and 255 characters long.',
      };
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let formData: Record<string, any> = {};
  let formDataValid = false;

  $: readyToSubmit =
    formDataValid && projectNameValidationState.type === 'valid' && selectedProject;

  async function handleSubmit() {
    doWithErrorModal(async () => {
      assert(projectName, 'Project name somehow not set');

      const application = await submitApplication(
        undefined,
        round.urlSlug,
        {
          projectName,
          dripsAccountId: selectedProject,
          fields: formData,
        },
        round.applicationFormat,
      );

      await invalidateAll();
      await goto(`/app/rpgf/rounds/${round.urlSlug}/applications/${application.id}`);
    });
  }
</script>

<div class="page">
  {#if round.state === 'intake'}
    <h1>Apply to {round.name}</h1>
    <p>
      To apply to this round, please first pick one of your existing project claimed on Drips. If
      you haven't claimed your project, click "Claim new project" below and follow the instructions.
      Any rewards from the round will be distributed directly to your selected project. <a
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
          on:click={() => modal.show(ClaimProjectStepper, undefined, { skipWalletConnect: true })}
        >
          Claim new project
        </Button>
      </div>
    </FormField>

    <FormField
      type="div"
      title="Project name*"
      description="Give your application a memorable name that describes it well."
      disabled={!selectedProject}
    >
      <TextInput
        bind:value={projectName}
        validationState={projectNameValidationState}
        disabled={!selectedProject}
      />
    </FormField>

    <DividerField />

    <RpgfApplicationForm
      bind:valid={formDataValid}
      bind:data={formData}
      disabled={!selectedProject || projectNameValidationState.type !== 'valid'}
      {applicationFormat}
    />

    <div style:align-self="flex-end">
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
