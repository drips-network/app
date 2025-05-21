<script lang="ts">
  import type { CreateRoundDraftDto } from "$lib/utils/rpgf/schemas";
  import { title } from "process";
  import Label from "../icons/Label.svelte";
  import TodoListItem from "./components/todo-list-item.svelte";
  import Ledger from "../icons/Ledger.svelte";
  import Calendar from "../icons/Calendar.svelte";
  import User from "../icons/User.svelte";
  import Button from "../button/button.svelte";
  import Registered from "../icons/Registered.svelte";

  export let draftId: string;
  export let draft: CreateRoundDraftDto;

  const requiredFields: (keyof typeof draft)[] = [
    "name",
    "urlSlug",
    "applicationPeriodStart",
    "applicationPeriodEnd",
    "votingPeriodStart",
    "votingPeriodEnd",
    "resultsPeriodStart",
    "applicationFormat",
    "votingConfig",
    "adminWalletAddresses",
  ];
  $: requiredFieldsFilled = requiredFields.every((field) => Boolean(draft[field]));

  $: nameAndDescriptionDone = Boolean(draft.name);
  $: scheduleDone = Boolean(
    draft.applicationPeriodStart &&
    draft.applicationPeriodEnd &&
    draft.votingPeriodStart &&
    draft.votingPeriodEnd &&
    draft.resultsPeriodStart
  );

  // TODO(rpgf): Compare against the default application format
  $: applicationFormCustomized = Boolean(draft.applicationFormat)

  $: additionalAdminsConfigured = Boolean(
    draft.adminWalletAddresses.length > 1
  )

  function handlePublish() {
    // TODO(rpgf): Implement publish logic
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
      href="/drafts/{draftId}/settings/representation"
    />
    <TodoListItem
      icon={Calendar}
      title="Schedule"
      done={scheduleDone}
      href="/drafts/{draftId}/settings/schedule"
    />
  </ul>

  <h2 class="typo-header-5" style:margin-top="1rem">Optional</h2>
  <ul style:margin-bottom="0.5rem">
    <TodoListItem
      icon={Ledger}
      title="Custom application form"
      done={applicationFormCustomized}
      href="/drafts/{draftId}/settings/application-form"
      optional
    />
    <TodoListItem
      icon={User}
      title="Additional admins"
      done={additionalAdminsConfigured}
      href="/drafts/{draftId}/settings/admins"
      optional
    />
  </ul>

  <Button
    variant="primary"
    disabled={!requiredFieldsFilled}
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
  }

  ul {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin: 0 -0.25rem;
  }
</style>