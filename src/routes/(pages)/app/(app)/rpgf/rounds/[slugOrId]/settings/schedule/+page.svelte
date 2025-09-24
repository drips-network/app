<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import DateInput from '$lib/components/date-picker/DateInput.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import { updateRound } from '$lib/utils/rpgf/rpgf.js';

  export let data;

  $: published = data.round.published;

  let updatedRound = { ...data.round };

  let now = new Date();

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
</script>

<RpgfSettingsForm round={data.round} saveEnabled={changesMade} {saveHandler}>
  <div style:width="100%">
    {#if published}
      <div style:margin-bottom="1rem">
        <AnnotationBox>
          The schedule of an ongoing, published round can no longer be changed. Contact the Drips
          team if necessary.
        </AnnotationBox>
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
    disabled={published}
  >
    <DateInput
      bind:value={updatedRound.applicationPeriodStart}
      min={!published ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Application intake end*"
    description="Applications are no longer accepted. Admins can review pending applications until voting starts."
    disabled={published}
  >
    <DateInput
      bind:value={updatedRound.applicationPeriodEnd}
      min={!published ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Voting start*"
    description="Badgeholders may now submit votes. Any applications still pending are automatically rejected."
    disabled={published}
  >
    <DateInput
      bind:value={updatedRound.votingPeriodStart}
      min={!published ? now : undefined}
      timePrecision="minute"
    />
  </FormField>

  <FormField
    title="Voting end*"
    description="The round no longer accepts ballot submissions. Admins can review the vote results, make final results public, and prepare the distribution."
    disabled={published}
  >
    <DateInput bind:value={updatedRound.votingPeriodEnd} min={now} timePrecision="minute" />
  </FormField>

  <FormField
    title="Distribution start*"
    description="In this phase, admins are expected to pay out rewards based on the round results using Drip Lists."
    disabled={published}
  >
    <DateInput
      bind:value={updatedRound.resultsPeriodStart}
      min={!published ? now : undefined}
      timePrecision="minute"
    />
  </FormField>
</RpgfSettingsForm>
