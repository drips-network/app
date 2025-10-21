<script lang="ts" context="module">
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

  export let round: Round;
  export let userId: string;
  export let categories: ApplicationCategory[];
  export let applicationForms: ApplicationForm[];
  export let projects: RpgfApplicationEditorProjectFragment[];

  export let prefilledAnswers: ApplicationAnswerDto = [];
  export let preselectedCategoryId: string | null = null;
  export let prefilledProjectName: string | null = null;
  export let preselectedDripsAccountId: string | null = null;

  export let forceRevealErrors = false;
  export let noPersistance = false;

  const INITIAL_STATE = {
    dripsAccountId: [],
    projectName: '',
    categoryId: [],
    answersByCategory: {},
  };

  const state = !noPersistance
    ? getLocallyStoredApplication(
        round.id,
        userId,
        categories,
        projects.map((p) => p.account.accountId),
        applicationForms,
      )
    : {
        ...writable<ApplicationData>(INITIAL_STATE),
        clear: () => state.set(INITIAL_STATE),
      };

  // Apply prefilled values if any, considering that both categories and / or fields
  // may have been deleted / edited by admins

  if (preselectedDripsAccountId) {
    $state.dripsAccountId = [preselectedDripsAccountId];
  }
  if (preselectedCategoryId) {
    if (categories.find((c) => c.id === preselectedCategoryId)) {
      $state.categoryId = [preselectedCategoryId];
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
        $state.answersByCategory[preselectedCategoryId] = prefilledAnswers.filter((a) =>
          validFieldIds.has(a.fieldId),
        );
      }
    }
  }
  if (prefilledProjectName) {
    $state.projectName = prefilledProjectName;
  }

  // Check if on mount anything has been restored from local storage
  let formDataHasBeenRestored = false;
  onMount(() => {
    if (noPersistance) return;

    if (
      $state.dripsAccountId[0] ||
      $state.projectName ||
      $state.categoryId[0] ||
      Object.keys($state.answersByCategory).length > 0
    ) {
      formDataHasBeenRestored = true;
    }
  });

  // "Hack" to avoid update loops on state
  $: stateCategoryId = $state.categoryId[0];

  let selectedCategory: ApplicationCategory | null = null;
  $: {
    selectedCategory = categories.find((category) => category.id === stateCategoryId) || null;
  }

  let formForSelectedCategory: ApplicationForm | null = applicationForms[0];
  $: {
    formForSelectedCategory = selectedCategory
      ? applicationForms.find((form) => selectedCategory?.applicationForm.id === form.id) || null
      : null;
  }

  // Step logic

  enum Step {
    ProjectSelection = 1,
    ApplicationName = 2,
    CategorySelection = 3,
    FormFilling = 4,
  }

  let currentStep: Step = Step.ProjectSelection;
  $: {
    if ($state.dripsAccountId.length > 0) {
      currentStep = Step.ApplicationName;

      if (applicationNameValidationState.type === 'valid') {
        currentStep = Step.CategorySelection;
        if ($state.categoryId) {
          currentStep = Step.FormFilling;
        }
      }
    } else {
      currentStep = Step.ProjectSelection;
    }
  }

  // Validation

  $: applicationNameValidationState = applicationNameValidator($state.projectName);
  $: projectSelected = $state.dripsAccountId !== null;
  $: applicationNameValid = applicationNameValidationState.type === 'valid';
  $: categorySelected = $state.categoryId !== null;
  let formDataValid = false;

  export let readyToSubmit: boolean;
  $: readyToSubmit = projectSelected && applicationNameValid && categorySelected && formDataValid;

  // Export full form data for binding
  export let value: {
    categoryId: string;
    categoryName: string;
    fields: ApplicationForm['fields'];
    dripsAccountId: string;
    projectName: string;
    answers: ApplicationAnswerDto;
  } | null = null;
  $: {
    if (
      $state.categoryId &&
      $state.dripsAccountId &&
      $state.projectName &&
      selectedCategory &&
      formForSelectedCategory
    ) {
      value = {
        categoryId: $state.categoryId[0],
        dripsAccountId: $state.dripsAccountId[0],
        categoryName: selectedCategory.name,
        fields: formForSelectedCategory.fields,
        projectName: $state.projectName,
        answers: $state.answersByCategory[$state.categoryId[0]],
      };
    } else {
      value = null;
    }
  }
</script>

{#if formDataHasBeenRestored}
  <div style:width="100%">
    <AnnotationBox type="info">
      We restored a previously saved application draft for you.
      <svelte:fragment slot="actions">
        <Button
          variant="destructive"
          on:click={() => {
            doWithConfirmationModal(
              'Are you sure you want to clear all fields? This action cannot be undone.',
              () => {
                state.clear();
                formDataHasBeenRestored = false;
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

<FormField
  type="div"
  title="Drips project*"
  description="Select one of your claimed projects to apply to the round with."
>
  <div class="list-select-wrapper min-height">
    <ProjectSelector {projects} bind:selected={$state.dripsAccountId} />
  </div>
  <div slot="action">
    <Button
      icon={Plus}
      on:click={() =>
        modal.show(ClaimProjectStepper, undefined, {
          skipWalletConnect: true,
          linkToProjectPageOnSuccess: false,
          skipNetworkSelection: true,
        })}
    >
      Claim new project
    </Button>
  </div>
</FormField>

<DividerField />

<FormField
  type="div"
  title="Project name*"
  description="Give your application a memorable name that describes it well."
  disabled={currentStep < Step.ApplicationName}
>
  <TextInput
    bind:value={$state.projectName}
    validationState={applicationNameValidationState}
    disabled={currentStep < Step.ApplicationName}
  />
</FormField>

<DividerField />

<FormField
  type="div"
  title="Application category*"
  description="Select the category that best fits your project. Your selection will determine which questions you need to answer in the next step."
  disabled={currentStep < Step.CategorySelection}
>
  <div class="list-select-wrapper">
    <CategorySelector {categories} bind:selected={$state.categoryId} />
  </div>
</FormField>

<DividerField />

{#if formForSelectedCategory && selectedCategory}
  <FormField
    type="div"
    title="Application form*"
    description="Fill out the application form. You can save your progress and come back later if you need more time."
    disabled={currentStep < Step.FormFilling}
  >
    {#key selectedCategory.id + '-' + formForSelectedCategory.id}
      <RpgfApplicationForm
        {forceRevealErrors}
        bind:valid={formDataValid}
        bind:answers={$state.answersByCategory[selectedCategory.id]}
        fields={formForSelectedCategory.fields}
        disabled={currentStep < Step.FormFilling}
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
