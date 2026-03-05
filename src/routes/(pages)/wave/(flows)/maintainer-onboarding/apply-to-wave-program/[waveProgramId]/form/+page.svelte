<script lang="ts">
  import { beforeNavigate, goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Card from '$lib/components/wave/card/card.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import Plus from '$lib/components/icons/Plus.svelte';
  import Trash from '$lib/components/icons/Trash.svelte';
  import { batchApplyRepos } from '$lib/utils/wave/wavePrograms';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import FlowStepWrapper from '../../../../shared/flow-step-wrapper.svelte';
  import type { PreviousParticipation } from '$lib/utils/wave/types/waveProgram';
  import type { Snapshot } from './$types.js';
  import { onMount } from 'svelte';

  let { data } = $props();

  const STORAGE_KEY = `wave-apply-repos-${data.waveProgram.id}`;

  let repoIds = $state<string[]>([]);
  let selectedRepos = $derived(data.ownRepos.data.filter((r) => repoIds.includes(r.id)));

  onMount(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        repoIds = JSON.parse(stored);
      } catch {
        // invalid data
      }
    }

    if (repoIds.length === 0) {
      goto(`/wave/maintainer-onboarding/apply-to-wave-program/${data.waveProgram.id}`);
    }
  });

  // Form state
  let previousParticipation = $state<string[]>([]);
  let plannedIssuesDescription = $state('');
  let repoRelationshipDescription = $state('');
  let upstreamRelationshipDescription = $state('');
  let forkJustification = $state('');
  let supportingLinks = $state<string[]>([]);
  let newLink = $state('');

  let hasUnsavedChanges = $derived(
    previousParticipation.length > 0 ||
      plannedIssuesDescription.length > 0 ||
      repoRelationshipDescription.length > 0 ||
      upstreamRelationshipDescription.length > 0 ||
      forkJustification.length > 0 ||
      supportingLinks.length > 0,
  );

  let submittedSuccessfully = $state(false);

  beforeNavigate((navigation) => {
    if (hasUnsavedChanges && !submittedSuccessfully) {
      if (!confirm('You have unsaved changes. Are you sure you want to leave?')) {
        navigation.cancel();
      }
    }
  });

  let newLinkIsDuplicate = $derived(supportingLinks.includes(newLink.trim()));

  let newLinkIsValid = $derived.by(() => {
    if (newLinkIsDuplicate) return false;
    try {
      const url = new URL(newLink.trim());
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  });

  function addLink() {
    if (newLinkIsValid) {
      supportingLinks = [...supportingLinks, newLink.trim()];
      newLink = '';
    }
  }

  function removeLink(index: number) {
    supportingLinks = supportingLinks.filter((_, i) => i !== index);
  }

  let touched = $state<Record<string, boolean>>({});
  function touch(field: string) {
    touched[field] = true;
  }

  // Conditional field visibility
  let multipleReposSelected = $derived(repoIds.length > 1);
  let anySelectedRepoIsFork = $derived(selectedRepos.some((r) => r.isFork === true));

  // Validation
  let plannedIssuesValid = $derived(
    plannedIssuesDescription.trim().length >= 1 && plannedIssuesDescription.length <= 5000,
  );
  let repoRelationshipValid = $derived(
    !multipleReposSelected ||
      (repoRelationshipDescription.trim().length >= 1 &&
        repoRelationshipDescription.length <= 5000),
  );
  let upstreamRelationshipValid = $derived(
    !anySelectedRepoIsFork ||
      (upstreamRelationshipDescription.trim().length >= 1 &&
        upstreamRelationshipDescription.length <= 5000),
  );
  let forkJustificationValid = $derived(
    !anySelectedRepoIsFork ||
      (forkJustification.trim().length >= 1 && forkJustification.length <= 5000),
  );

  let formValid = $derived(
    plannedIssuesValid &&
      repoRelationshipValid &&
      upstreamRelationshipValid &&
      forkJustificationValid,
  );

  let previousParticipationItems: Items = {
    previous_wave: { type: 'selectable', label: 'A previous Drips Wave' },
    onlydust_stellar_missions: { type: 'selectable', label: 'OnlyDust Stellar Missions' },
    stellar_community_fund: { type: 'selectable', label: 'Stellar Community Fund' },
    stellar_hackathon: { type: 'selectable', label: 'A Stellar Hackathon' },
    other_stellar_ecosystem_program: {
      type: 'selectable',
      label: 'Another Stellar ecosystem program',
    },
  };

  interface SnapshotData {
    previousParticipation: string[];
    plannedIssuesDescription: string;
    repoRelationshipDescription: string;
    upstreamRelationshipDescription: string;
    forkJustification: string;
    supportingLinks: string[];
  }

  export const snapshot: Snapshot<SnapshotData> = {
    capture: () => ({
      previousParticipation,
      plannedIssuesDescription,
      repoRelationshipDescription,
      upstreamRelationshipDescription,
      forkJustification,
      supportingLinks,
    }),
    restore: (value) => {
      previousParticipation = value.previousParticipation;
      plannedIssuesDescription = value.plannedIssuesDescription;
      repoRelationshipDescription = value.repoRelationshipDescription;
      upstreamRelationshipDescription = value.upstreamRelationshipDescription;
      forkJustification = value.forkJustification;
      supportingLinks = value.supportingLinks;
    },
  };

  let applying = $state(false);

  async function handleApply() {
    applying = true;

    try {
      await doWithErrorModal(async () => {
        await batchApplyRepos(undefined, data.waveProgram.id, repoIds, {
          previousParticipation: previousParticipation as PreviousParticipation[],
          plannedIssuesDescription,
          ...(multipleReposSelected ? { repoRelationshipDescription } : {}),
          ...(anySelectedRepoIsFork ? { upstreamRelationshipDescription, forkJustification } : {}),
          supportingLinks: supportingLinks.length > 0 ? supportingLinks : undefined,
        });
      });

      submittedSuccessfully = true;
      goto(`/wave/maintainer-onboarding/apply-to-wave-program/${data.waveProgram.id}/success`);
    } finally {
      applying = false;
    }
  }

  function handleBeforeUnload(e: BeforeUnloadEvent) {
    if (hasUnsavedChanges && !submittedSuccessfully) {
      e.preventDefault();
    }
  }
</script>

<svelte:window onbeforeunload={handleBeforeUnload} />

<FlowStepWrapper
  headline="Application form"
  description="Answer a few questions about the {repoIds.length === 1
    ? 'repo'
    : `${repoIds.length} repos`} you're applying to the {data.waveProgram.name} Wave Program."
>
  <FormField
    title="Previous participation"
    description="Have you previously participated in any of the following programs? Select all that apply."
    type="div"
  >
    <Card style="padding: 0; text-align: left; width: 100%;">
      <ListSelect
        multiselect
        searchable={false}
        items={previousParticipationItems}
        bind:selected={previousParticipation}
      />
    </Card>
  </FormField>

  <FormField
    title="Planned issues*"
    descriptionMd={`The Wave Program works by having maintainers create scoped issues that contributors pick up during sprint cycles. 

Describe the types of work you'd post — bug fixes, new features, documentation, testing, etc.`}
    type="div"
    validationState={touched['plannedIssues'] && !plannedIssuesValid
      ? {
          type: 'invalid',
          message:
            plannedIssuesDescription.length > 5000
              ? 'Must not exceed 5,000 characters.'
              : 'This field is required.',
        }
      : { type: 'valid' }}
  >
    <TextArea
      bind:value={plannedIssuesDescription}
      placeholder="We plan to add issues related to..."
      onblur={() => touch('plannedIssues')}
    />
    <div class="char-count">
      <span class:too-long={plannedIssuesDescription.length > 5000} class="tnum"
        >{plannedIssuesDescription.length} / 5,000</span
      >
    </div>
  </FormField>

  {#if multipleReposSelected}
    <FormField
      title="Repo relationship*"
      description="You selected multiple repos. Please describe how they are related to each other."
      type="div"
      validationState={touched['repoRelationship'] && !repoRelationshipValid
        ? {
            type: 'invalid',
            message:
              repoRelationshipDescription.length > 5000
                ? 'Must not exceed 5,000 characters.'
                : 'This field is required when applying multiple repos.',
          }
        : { type: 'valid' }}
    >
      <TextArea
        bind:value={repoRelationshipDescription}
        placeholder="These repos are related because..."
        onblur={() => touch('repoRelationship')}
      />
      <div class="char-count">
        <span class:too-long={repoRelationshipDescription.length > 5000} class="tnum"
          >{repoRelationshipDescription.length} / 5,000</span
        >
      </div>
    </FormField>
  {/if}

  {#if anySelectedRepoIsFork}
    <AnnotationBox type="info">
      One or more of your selected repos is a fork. Please answer the following additional
      questions.
    </AnnotationBox>

    <FormField
      title="Upstream relationship*"
      description="Describe the relationship between your fork(s) and the upstream repo(s)."
      type="div"
      validationState={touched['upstreamRelationship'] && !upstreamRelationshipValid
        ? {
            type: 'invalid',
            message:
              upstreamRelationshipDescription.length > 5000
                ? 'Must not exceed 5,000 characters.'
                : 'This field is required for forked repos.',
          }
        : { type: 'valid' }}
    >
      <TextArea
        bind:value={upstreamRelationshipDescription}
        placeholder="The relationship to the upstream repo is..."
        onblur={() => touch('upstreamRelationship')}
      />
      <div class="char-count">
        <span class:too-long={upstreamRelationshipDescription.length > 5000} class="tnum"
          >{upstreamRelationshipDescription.length} / 5,000</span
        >
      </div>
    </FormField>

    <FormField
      title="Fork justification*"
      descriptionMd={`Help us understand the context of why you're submitting a fork.
      
**Example:** "The original project went inactive 6 months ago; I'm continuing development independently".

There's no wrong answer. We need this context to review forks accurately.`}
      type="div"
      validationState={touched['forkJustification'] && !forkJustificationValid
        ? {
            type: 'invalid',
            message:
              forkJustification.length > 5000
                ? 'Must not exceed 5,000 characters.'
                : 'This field is required for forked repos.',
          }
        : { type: 'valid' }}
    >
      <TextArea
        bind:value={forkJustification}
        placeholder="We are applying with this fork because..."
        onblur={() => touch('forkJustification')}
      />
      <div class="char-count">
        <span class:too-long={forkJustification.length > 5000} class="tnum"
          >{forkJustification.length} / 5,000</span
        >
      </div>
    </FormField>
  {/if}

  <FormField
    title="Supporting links"
    description="Provide links to resources relevant to your project (e.g. website, documentation, social media, deployed contracts). Up to 10 links."
    type="div"
  >
    {#if supportingLinks.length > 0}
      <ul class="links-list">
        {#each supportingLinks as link, i (link)}
          <li>
            <span class="typo-text link-url">{link}</span>
            <Button size="small" icon={Trash} onclick={() => removeLink(i)}>Remove</Button>
          </li>
        {/each}
      </ul>
    {/if}
    <div class="add-link-row">
      <TextInput
        bind:value={newLink}
        placeholder={supportingLinks.length >= 10 ? 'Link limit reached' : 'https://...'}
        disabled={supportingLinks.length >= 10}
        onkeydown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addLink();
          }
        }}
      />
      <Button
        size="large"
        icon={Plus}
        disabled={!newLinkIsValid || supportingLinks.length >= 10}
        onclick={addLink}>Add link</Button
      >
    </div>
  </FormField>

  <AnnotationBox>
    By submitting this application, you confirm that all provided information is accurate.
    Inaccurate information may result in your application being rejected and could lead to
    disqualification from the Drips Wave Program.
  </AnnotationBox>

  {#snippet leftActions()}
    <Button
      icon={ArrowLeft}
      href="/wave/maintainer-onboarding/apply-to-wave-program/{data.waveProgram.id}"
      >Back to repo selection</Button
    >
  {/snippet}

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={!formValid}
      icon={CheckCircle}
      loading={applying}
      onclick={handleApply}>Apply selected repos</Button
    >
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

  .links-list {
    list-style: none;
    padding: 0;
    margin: 0 0 0.75rem 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .links-list li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--color-foreground-level-1);
    border-radius: 1rem 0 1rem 1rem;
  }

  .links-list .link-url {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .add-link-row {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }
</style>
