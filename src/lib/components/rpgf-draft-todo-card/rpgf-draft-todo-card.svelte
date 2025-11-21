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
  import type { Round } from '$lib/utils/rpgf/types/round';
  import Link from '../icons/Link.svelte';

  interface Props {
    round: Round;
    amountOfVoters: number;
  }

  let { round, amountOfVoters }: Props = $props();

  let nameAndDescriptionDone = $derived(Boolean(round.name && round.urlSlug));
  let scheduleDone = $derived(
    Boolean(
      round.applicationPeriodStart &&
        round.applicationPeriodEnd &&
        round.votingPeriodStart &&
        round.votingPeriodEnd &&
        round.resultsPeriodStart,
    ),
  );
  let votingConfigDone = $derived(
    Boolean(round.maxVotesPerProjectPerVoter && round.maxVotesPerVoter),
  );

  function handlePublish() {
    modal.show(Stepper, undefined, publishRpgfRoundFlowSteps(round.id));
  }
</script>

<div class="draft-todo-card">
  <h2 class="typo-header-5">To-do</h2>
  <p>Complete the following settings to publish your round.</p>
  <ul>
    <TodoListItem
      icon={Label}
      title="Name & URL"
      done={nameAndDescriptionDone}
      href="/app/rpgf/rounds/{round.id}/settings/representation"
    />
    <TodoListItem
      icon={Calendar}
      title="Schedule"
      done={scheduleDone}
      href="/app/rpgf/rounds/{round.id}/settings/schedule"
      error={scheduleDone && !round.validation?.scheduleValid}
    />
    <TodoListItem
      icon={Proposals}
      title="Voting configuration"
      done={votingConfigDone}
      href="/app/rpgf/rounds/{round.id}/settings/voting"
    />
    <TodoListItem
      icon={User}
      title="Badgeholder list"
      done={amountOfVoters > 0}
      href="/app/rpgf/rounds/{round.id}/settings/voting"
    />
    <TodoListItem
      icon={Ledger}
      title="Application form"
      done={round.validation?.applicationFormValid ?? false}
      href="/app/rpgf/rounds/{round.id}/settings/application"
    />
  </ul>

  <h2 class="typo-header-5" style:margin-top="1rem">Optional</h2>
  <ul style:margin-bottom="0.5rem">
    <TodoListItem
      icon={Link}
      title="Voter guidelines link"
      done={Boolean(round.voterGuidelinesLink)}
      href="/app/rpgf/rounds/{round.id}/settings/voting"
      optional
    />

    <TodoListItem
      icon={User}
      title="Additional admins"
      done={round.adminCount ? round.adminCount > 1 : false}
      href="/app/rpgf/rounds/{round.id}/settings/admins"
      optional
    />
  </ul>

  <Button
    variant="primary"
    disabled={!round.validation?.readyToPublish}
    icon={Registered}
    size="large"
    onclick={handlePublish}
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
