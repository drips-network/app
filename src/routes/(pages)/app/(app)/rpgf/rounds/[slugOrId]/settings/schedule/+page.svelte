<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import { updateRound } from '$lib/utils/rpgf/rpgf.js';

  let { data } = $props();
  let round = $derived(data.round);
  let published = $derived(data.round.published);

  let updatedRound = $state({ ...data.round });

  let now = new Date();

  let changesMade = $derived(
    updatedRound.applicationPeriodStart?.getTime() !==
      data.round.applicationPeriodStart?.getTime() ||
      updatedRound.applicationPeriodEnd?.getTime() !== data.round.applicationPeriodEnd?.getTime() ||
      updatedRound.votingPeriodStart?.getTime() !== data.round.votingPeriodStart?.getTime() ||
      updatedRound.votingPeriodEnd?.getTime() !== data.round.votingPeriodEnd?.getTime() ||
      updatedRound.resultsPeriodStart?.getTime() !== data.round.resultsPeriodStart?.getTime(),
  );

  function isDifferent(date1: Date | null, date2: Date | null) {
    if (date1 === null && date2 === null) return false;
    if (date1 === null || date2 === null) return true;
    return date1.getTime() !== date2.getTime();
  }

  async function saveHandler() {
    await updateRound(undefined, data.round.id, {
      applicationPeriodStart: isDifferent(
        updatedRound.applicationPeriodStart,
        data.round.applicationPeriodStart,
      )
        ? updatedRound.applicationPeriodStart
        : undefined,
      applicationPeriodEnd: isDifferent(
        updatedRound.applicationPeriodEnd,
        data.round.applicationPeriodEnd,
      )
        ? updatedRound.applicationPeriodEnd
        : undefined,
      votingPeriodStart: isDifferent(updatedRound.votingPeriodStart, data.round.votingPeriodStart)
        ? updatedRound.votingPeriodStart
        : undefined,
      votingPeriodEnd: isDifferent(updatedRound.votingPeriodEnd, data.round.votingPeriodEnd)
        ? updatedRound.votingPeriodEnd
        : undefined,
      resultsPeriodStart: isDifferent(
        updatedRound.resultsPeriodStart,
        data.round.resultsPeriodStart,
      )
        ? updatedRound.resultsPeriodStart
        : undefined,
    });
  }
</script>

<RpgfSettingsForm saveEnabled={changesMade} {saveHandler}>
  <div style:width="100%">
    {#if published}
      <div style:margin-bottom="1rem">
        <AnnotationBox>Schedule timestamps in the past can no longer be changed.</AnnotationBox>
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
    disabled={published && round.applicationPeriodStart
      ? round.applicationPeriodStart < now
      : false}
  >
    <DateInput
      bind:value={updatedRound.applicationPeriodStart}
      min={published ? undefined : now}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Application intake end*"
    description="Applications are no longer accepted. Admins can review pending applications until voting starts."
    disabled={published && round.applicationPeriodEnd ? round.applicationPeriodEnd < now : false}
  >
    <DateInput
      bind:value={updatedRound.applicationPeriodEnd}
      min={published ? undefined : now}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Voting start*"
    description="Badgeholders may now submit votes. Any applications still pending are automatically rejected."
    disabled={published && round.votingPeriodStart ? round.votingPeriodStart < now : false}
  >
    <DateInput
      bind:value={updatedRound.votingPeriodStart}
      min={published ? undefined : now}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Voting end*"
    description="The round no longer accepts ballot submissions. Admins can review the vote results, make final results public, and prepare the distribution."
    disabled={published && round.votingPeriodEnd ? round.votingPeriodEnd < now : false}
  >
    <DateInput bind:value={updatedRound.votingPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Distribution start*"
    description="In this phase, admins are expected to pay out rewards based on the round results using Drip Lists."
    disabled={published && round.resultsPeriodStart ? round.resultsPeriodStart < now : false}
  >
    <DateInput
      bind:value={updatedRound.resultsPeriodStart}
      min={published ? undefined : now}
      timePrecision="minute"
    />
  </FormField>
</RpgfSettingsForm>
