<script lang="ts" module>
  export const RPGF_APPLICATION_EDITOR_PROJECT_FRAGMENT = gql`
    ${PROJECT_BADGE_FRAGMENT}
    fragment RpgfApplicationEditorProject on Project {
      ...ProjectBadge
      account {
        accountId
      }
    }
  `;
</script>

<script lang="ts">
  import { run } from 'svelte/legacy';

  import type {
    ApplicationAnswerDto,
    ApplicationCategory,
    ApplicationForm,
  } from '$lib/utils/rpgf/types/application';
  import type { Round } from '$lib/utils/rpgf/types/round';
  import { gql } from 'graphql-request';
  import { PROJECT_BADGE_FRAGMENT } from '../project-badge/project-badge.svelte';
  import type { RpgfApplicationEditorProjectFragment } from './__generated__/gql.generated';
  import FormField from '../form-field/form-field.svelte';
  import Button from '../button/button.svelte';
  import Plus from '../icons/Plus.svelte';
  import modal from '$lib/stores/modal';
  import ClaimProjectStepper from '$lib/flows/claim-project-flow/claim-project-stepper.svelte';
  import ProjectSelector from './components/project-selector.svelte';
  import TextInput from '../text-input/text-input.svelte';
  import applicationNameValidator from './validators/application-name-validator';
  import CategorySelector from './components/category-selector.svelte';
  import DividerField from '../rpgf-application-form/components/divider-field.svelte';
  import RpgfApplicationForm from '../rpgf-application-form/rpgf-application-form.svelte';
  import {
    getLocallyStoredApplication,
    type ApplicationData,
  } from '../../../routes/(pages)/app/(app)/rpgf/rounds/[slugOrId]/applications/new/locally-stored-application';
  import { writable } from 'svelte/store';
  import { onMount } from 'svelte';
  import AnnotationBox from '../annotation-box/annotation-box.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';

  interface Props {
    round: Round;
    userId: string;
    categories: ApplicationCategory[];
    applicationForms: ApplicationForm[];
    projects: RpgfApplicationEditorProjectFragment[];
    prefilledAnswers?: ApplicationAnswerDto;
    preselectedCategoryId?: string | null;
    prefilledProjectName?: string | null;
    preselectedDripsAccountId?: string | null;
    forceRevealErrors?: boolean;
    noPersistance?: boolean;
    readyToSubmit: boolean;
    // Export full form data for binding
    value?: {
      categoryId: string;
      categoryName: string;
      fields: ApplicationForm['fields'];
      dripsAccountId: string;
      projectName: string;
      answers: ApplicationAnswerDto;
    } | null;
  }

  let {
    round,
    userId,
    categories,
    applicationForms,
    projects,
    prefilledAnswers = [],
    preselectedCategoryId = null,
    prefilledProjectName = null,
    preselectedDripsAccountId = null,
    forceRevealErrors = false,
    noPersistance = false,
    readyToSubmit = $bindable(),
    value = $bindable(),
  }: Props = $props();

  const INITIAL_STATE = {
    dripsAccountId: [],
    projectName: '',
    categoryId: [],
    answersByCategory: {},
  };

  const applicationState = !noPersistance
    ? getLocallyStoredApplication(
        round.id,
        userId,
        categories,
        projects.map((p) => p.account.accountId),
        applicationForms,
      )
    : {
        ...writable<ApplicationData>(INITIAL_STATE),
        clear: () => applicationState.set(INITIAL_STATE),
      };

  // Apply prefilled values if any, considering that both categories and / or fields
  // may have been deleted / edited by admins

  if (preselectedDripsAccountId) {
    $applicationState.dripsAccountId = [preselectedDripsAccountId];
  }
  if (preselectedCategoryId) {
    if (categories.find((c) => c.id === preselectedCategoryId)) {
      $applicationState.categoryId = [preselectedCategoryId];
    }
  }
  if (prefilledAnswers.length > 0) {
    if (preselectedCategoryId) {
      // Can't apply answers without a category
      const formForCategory = applicationForms.find(
        (form) =>
          form.id === categories.find((c) => c.id === preselectedCategoryId)?.applicationForm.id,
      );
      if (formForCategory) {
        // Filter out any answers that don't correspond to existing fields
        const validFieldIds = new Set(formForCategory.fields.map((f) => f.id));
        $applicationState.answersByCategory[preselectedCategoryId] = prefilledAnswers.filter((a) =>
          validFieldIds.has(a.fieldId),
        );
      }
    }
  }
  if (prefilledProjectName) {
    $applicationState.projectName = prefilledProjectName;
  }

  // Check if on mount anything has been restored from local storage
  let formDataHasBeenRestored = $state(false);
  onMount(() => {
    if (noPersistance) return;

    if (
      $applicationState.dripsAccountId[0] ||
      $applicationState.projectName ||
      $applicationState.categoryId[0] ||
      Object.keys($applicationState.answersByCategory).length > 0
    ) {
      formDataHasBeenRestored = true;
    }
  });

  let selectedCategory: ApplicationCategory | null = $state(null);

  let formForSelectedCategory: ApplicationForm | null = $state(applicationForms[0]);

  // Step logic

  const STEP_SEQUENCE = {
    ProjectSelection: 1,
    ApplicationName: 2,
    CategorySelection: 3,
    FormFilling: 4,
  };
  type Step = (typeof STEP_SEQUENCE)[keyof typeof STEP_SEQUENCE];

  let currentStep = $state<Step>(STEP_SEQUENCE.ProjectSelection);

  let formDataValid = $state(false);

  let applicationNameValidationState = $derived(
    applicationNameValidator($applicationState.projectName),
  );

  // "Hack" to avoid update loops on applicationState
  let applicationStateCategoryId = $derived($applicationState.categoryId[0]);
  run(() => {
    selectedCategory =
      categories.find((category) => category.id === applicationStateCategoryId) || null;
  });
  run(() => {
    formForSelectedCategory = selectedCategory
      ? applicationForms.find((form) => selectedCategory?.applicationForm.id === form.id) || null
      : null;
  });
  run(() => {
    if ($applicationState.dripsAccountId.length > 0) {
      currentStep = STEP_SEQUENCE.ApplicationName;

      if (applicationNameValidationState.type === 'valid') {
        currentStep = STEP_SEQUENCE.CategorySelection;
        if ($applicationState.categoryId) {
          currentStep = STEP_SEQUENCE.FormFilling;
        }
      }
    } else {
      currentStep = STEP_SEQUENCE.ProjectSelection;
    }
  });

  let projectSelected = $derived($applicationState.dripsAccountId !== null);
  let applicationNameValid = $derived(applicationNameValidationState.type === 'valid');
  let categorySelected = $derived($applicationState.categoryId !== null);
  run(() => {
    readyToSubmit = projectSelected && applicationNameValid && categorySelected && formDataValid;
  });
  run(() => {
    if (
      $applicationState.categoryId &&
      $applicationState.dripsAccountId &&
      $applicationState.projectName &&
      selectedCategory &&
      formForSelectedCategory
    ) {
      value = {
        categoryId: $applicationState.categoryId[0],
        dripsAccountId: $applicationState.dripsAccountId[0],
        categoryName: selectedCategory.name,
        fields: formForSelectedCategory.fields,
        projectName: $applicationState.projectName,
        answers: $applicationState.answersByCategory[$applicationState.categoryId[0]],
      };
    } else {
      value = null;
    }
  });
</script>

{#if formDataHasBeenRestored}
  <div style:width="100%">
    <AnnotationBox type="info">
      We restored a previously saved application draft for you.
      {#snippet actions()}
        <Button
          variant="destructive"
          onclick={() => {
            doWithConfirmationModal(
              'Are you sure you want to clear all fields? This action cannot be undone.',
              () => {
                applicationState.clear();
                formDataHasBeenRestored = false;
              },
            );
          }}
        >
          Clear all fields
        </Button>
      {/snippet}
    </AnnotationBox>
  </div>
{/if}

<FormField
  type="div"
  title="Drips project*"
  description="Select one of your claimed projects to apply to the round with."
>
  <div class="list-select-wrapper min-height">
    <ProjectSelector {projects} bind:selected={$applicationState.dripsAccountId} />
  </div>
  {#snippet action()}
    <div>
      <Button
        icon={Plus}
        onclick={() =>
          modal.show(ClaimProjectStepper, undefined, {
            skipWalletConnect: true,
            linkToProjectPageOnSuccess: false,
            skipNetworkSelection: true,
          })}
      >
        Claim new project
      </Button>
    </div>
  {/snippet}
</FormField>

<DividerField />

<FormField
  type="div"
  title="Project name*"
  description="Give your application a memorable name that describes it well."
  disabled={currentStep < STEP_SEQUENCE.ApplicationName}
>
  <TextInput
    bind:value={$applicationState.projectName}
    validationState={applicationNameValidationState}
    disabled={currentStep < STEP_SEQUENCE.ApplicationName}
  />
</FormField>

<DividerField />

<FormField
  type="div"
  title="Application category*"
  description="Select the category that best fits your project. Your selection will determine which questions you need to answer in the next step."
  disabled={currentStep < STEP_SEQUENCE.CategorySelection}
>
  <div class="list-select-wrapper">
    <CategorySelector {categories} bind:selected={$applicationState.categoryId} />
  </div>
</FormField>

<DividerField />

{#if formForSelectedCategory && selectedCategory}
  <FormField
    type="div"
    title="Application form*"
    description="Fill out the application form. You can save your progress and come back later if you need more time."
    disabled={currentStep < STEP_SEQUENCE.FormFilling}
  >
    {#key selectedCategory.id + '-' + formForSelectedCategory.id}
      <RpgfApplicationForm
        {forceRevealErrors}
        bind:valid={formDataValid}
        bind:answers={$applicationState.answersByCategory[selectedCategory.id]}
        fields={formForSelectedCategory.fields}
        disabled={currentStep < STEP_SEQUENCE.FormFilling}
      />
    {/key}
  </FormField>
{/if}

<style>
  .list-select-wrapper {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    overflow: hidden;
  }
</style>
