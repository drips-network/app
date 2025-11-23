<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import { updateRound } from '$lib/utils/rpgf/rpgf.js';
  import { onMount } from 'svelte';

  export let data;
  $: round = data.round;

  $: published = data.round.published;

  let updatedRound = { ...data.round };

  $: changesMade =
    updatedRound.applicationPeriodStart?.getTime() !==
      data.round.applicationPeriodStart?.getTime() ||
    updatedRound.applicationPeriodEnd?.getTime() !== data.round.applicationPeriodEnd?.getTime() ||
    updatedRound.votingPeriodStart?.getTime() !== data.round.votingPeriodStart?.getTime() ||
    updatedRound.votingPeriodEnd?.getTime() !== data.round.votingPeriodEnd?.getTime() ||
    updatedRound.resultsPeriodStart?.getTime() !== data.round.resultsPeriodStart?.getTime();

  async function saveHandler() {
    await updateRound(undefined, data.round.id, {
      applicationPeriodStart: updatedRound.applicationPeriodStart,
      applicationPeriodEnd: updatedRound.applicationPeriodEnd,
      votingPeriodStart: updatedRound.votingPeriodStart,
      votingPeriodEnd: updatedRound.votingPeriodEnd,
      resultsPeriodStart: updatedRound.resultsPeriodStart,
    });
  }

  let interval: NodeJS.Timeout;
  let now = new Date();
  onMount(() => {
    interval = setInterval(() => {
      now = new Date();
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  });
</script>

<RpgfSettingsForm saveEnabled={changesMade} {saveHandler}>
  <div style:width="100%">
    {#if published}
      <div style:margin-bottom="1rem">
        <AnnotationBox>You can only edit timestamps that are in the future.</AnnotationBox>
      </div>
    {/if}

    <AnnotationBox type="info">
      All dates shown here are in your local timezone ({Intl.DateTimeFormat().resolvedOptions()
        .timeZone}). Users viewing the schedule will see the dates in their own local timezone.
    </AnnotationBox>
  </div>

  <FormField
    title="Application intake start*"
    description="From this date onwards, anyone can submit applications."
    disabled={round.applicationPeriodStart ? round.applicationPeriodStart < now : false}
  >
    <DateInput bind:value={updatedRound.applicationPeriodStart} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Application intake end*"
    description="Applications are no longer accepted. Admins can review pending applications until voting starts."
    disabled={round.applicationPeriodEnd ? round.applicationPeriodEnd < now : false}
  >
    <DateInput bind:value={updatedRound.applicationPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Voting start*"
    description="Badgeholders may now submit votes. Any applications still pending are automatically rejected."
    disabled={round.votingPeriodStart ? round.votingPeriodStart < now : false}
  >
    <DateInput bind:value={updatedRound.votingPeriodStart} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Voting end*"
    description="The round no longer accepts ballot submissions. Admins can review the vote results, make final results public, and prepare the distribution."
    disabled={round.votingPeriodEnd ? round.votingPeriodEnd < now : false}
  >
    <DateInput bind:value={updatedRound.votingPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Distribution start*"
    description="In this phase, admins are expected to pay out rewards based on the round results using Drip Lists."
    disabled={round.resultsPeriodStart ? round.resultsPeriodStart < now : false}
  >
    <DateInput bind:value={updatedRound.resultsPeriodStart} min={now} timePrecision="minute" />
  </FormField>
</RpgfSettingsForm>
