<script lang="ts">
  import Label from '../icons/Label.svelte';
  import TodoListItem from './components/todo-list-item.svelte';
  import Ledger from '../icons/Ledger.svelte';
  import Calendar from '../icons/Calendar.svelte';
  import User from '../icons/User.svelte';
  import Button from '../button/button.svelte';
  import Registered from '../icons/Registered.svelte';
  import Proposals from '../icons/Proposals.svelte';
  import modal from '$lib/stores/modal';
  import Stepper from '../stepper/stepper.svelte';
  import publishRpgfRoundFlowSteps from '$lib/flows/publish-rpgf-round/publish-rpgf-round-flow-steps';
  import { matchPreset } from '$lib/utils/rpgf/application-form-presets';
  import type { WrappedRoundDraft } from '$lib/utils/rpgf/schemas';

  export let draftWrapper: WrappedRoundDraft;
  $: draft = draftWrapper.draft;
  $: draftId = draftWrapper.id;

  $: serverSideValidationOk = Object.values(draftWrapper.validation).every((v) => v === true);

  const requiredFields: (keyof typeof draft)[] = [
    'name',
    'urlSlug',
    'applicationPeriodStart',
    'applicationPeriodEnd',
    'votingPeriodStart',
    'votingPeriodEnd',
    'resultsPeriodStart',
    'applicationFormat',
    'votingConfig',
    'adminWalletAddresses',
  ];
  $: requiredFieldsFilled = requiredFields.every((field) => Boolean(draft[field]));

  $: nameAndDescriptionDone = Boolean(draft.name && draft.urlSlug);
  $: scheduleDone = Boolean(
    draft.applicationPeriodStart &&
      draft.applicationPeriodEnd &&
      draft.votingPeriodStart &&
      draft.votingPeriodEnd &&
      draft.resultsPeriodStart,
  );
  $: votingConfigDone = Boolean(draft.votingConfig && draft.votingConfig.allowedVoters.length > 0);

  // TODO(rpgf): Compare against the default application format
  $: applicationFormCustomized = draft.applicationFormat
    ? matchPreset(draft.applicationFormat)?.slug !== 'default'
    : false;

  $: additionalAdminsConfigured = Boolean(draft.adminWalletAddresses.length > 1);

  function handlePublish() {
    modal.show(Stepper, undefined, publishRpgfRoundFlowSteps(draftId));
  }
</script>

<div class="draft-todo-card">
  <h2 class="typo-header-5">To-do</h2>
  <p>Complete the following settings to publish your round.</p>
  <ul>
    <TodoListItem
      icon={Label}
      title="Name & Description"
      done={nameAndDescriptionDone}
      href="/app/rpgf/drafts/{draftId}/settings/representation"
    />
    <TodoListItem
      icon={Calendar}
      title="Schedule"
      done={scheduleDone}
      href="/app/rpgf/drafts/{draftId}/settings/schedule"
      error={!draftWrapper.validation.scheduleValid}
    />
    <TodoListItem
      icon={Proposals}
      title="Badgeholders & voting"
      done={votingConfigDone}
      href="/app/rpgf/drafts/{draftId}/settings/voting"
    />
  </ul>

  <h2 class="typo-header-5" style:margin-top="1rem">Optional</h2>
  <ul style:margin-bottom="0.5rem">
    <TodoListItem
      icon={Ledger}
      title="Custom application form"
      done={applicationFormCustomized}
      href="/app/rpgf/drafts/{draftId}/settings/application"
      optional
    />
    <TodoListItem
      icon={User}
      title="Additional admins"
      done={additionalAdminsConfigured}
      href="/app/rpgf/drafts/{draftId}/settings/admins"
      optional
    />
  </ul>

  <Button
    variant="primary"
    disabled={!requiredFieldsFilled || !serverSideValidationOk}
    icon={Registered}
    size="large"
    on:click={handlePublish}
  >
    Publish round
  </Button>
</div>

<style>
  .draft-todo-card {
    padding: 1rem;
    border-radius: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    border: 1px solid var(--color-foreground-level-3);
    view-transition-name: draft-todo-card;
    view-transition-class: element-handover;
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0 -0.25rem;
  }
</style>
