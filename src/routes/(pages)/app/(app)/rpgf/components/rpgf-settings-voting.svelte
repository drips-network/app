<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Items } from '$lib/components/list-editor/types';
  import ensureAtLeastOneArrayMember from '$lib/utils/ensure-at-least-one-array-member';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };

  let voterItems: Items = Object.fromEntries(
    updatedRoundOrDraft.votingConfig?.allowedVoters.map((address) => {
      return [
        address,
        {
          type: 'address',
          address,
        },
      ];
    }) ?? [],
  );

  let votesPerVoter = updatedRoundOrDraft.votingConfig?.maxVotesPerVoter ?? undefined;
  let maxVotesPerProject =
    updatedRoundOrDraft.votingConfig?.maxVotesPerProjectPerVoter ?? undefined;

  $: addresses = mapFilterUndefined(
    Object.values(voterItems).map((item) => {
      if (item.type === 'address') {
        return item.address;
      } else {
        return undefined;
      }
    }),
    (v) => v,
  );

  let votesPerVoterValidationState: TextInputValidationState = { type: 'unvalidated' };
  $: {
    if (!votesPerVoter) {
      votesPerVoterValidationState = { type: 'unvalidated' };
    } else if (votesPerVoter < 1) {
      votesPerVoterValidationState = { type: 'invalid', message: 'Must be at least 1' };
    } else if (maxVotesPerProject && votesPerVoter < maxVotesPerProject) {
      votesPerVoterValidationState = {
        type: 'invalid',
        message: 'Must be equal or higher than max votes per project',
      };
    } else {
      votesPerVoterValidationState = { type: 'valid' };
    }
  }

  let maxVotesPerProjectValidationState: TextInputValidationState = { type: 'unvalidated' };
  $: {
    if (!maxVotesPerProject) {
      maxVotesPerProjectValidationState = { type: 'unvalidated' };
    } else if (maxVotesPerProject < 1) {
      maxVotesPerProjectValidationState = { type: 'invalid', message: 'Must be at least 1' };
    } else if (votesPerVoter && maxVotesPerProject > votesPerVoter) {
      maxVotesPerProjectValidationState = {
        type: 'invalid',
        message: 'Must be equal or lower than votes per voter',
      };
    } else {
      maxVotesPerProjectValidationState = { type: 'valid' };
    }
  }

  $: valid =
    Boolean(
      votesPerVoterValidationState.type === 'valid' &&
        maxVotesPerProjectValidationState.type === 'valid' &&
        ensureAtLeastOneArrayMember(addresses) &&
        votesPerVoter &&
        maxVotesPerProject,
    ) ||
    // If draft, allow deleting voting config
    (settingsFormProps.isDraft &&
      votesPerVoterValidationState.type === 'unvalidated' &&
      maxVotesPerProjectValidationState.type === 'unvalidated' &&
      !addresses.length);

  $: {
    if (ensureAtLeastOneArrayMember(addresses) && votesPerVoter && maxVotesPerProject) {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        votingConfig: {
          maxVotesPerVoter: Number(votesPerVoter),
          maxVotesPerProjectPerVoter: Number(maxVotesPerProject),
          allowedVoters: addresses,
        },
      };
    } else {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        votingConfig: undefined,
      };
    }
  }
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft invalid={!valid}>
  <FormField title="Votes per voter*">
    <TextInput
      placeholder="1000"
      validationState={votesPerVoterValidationState}
      bind:value={votesPerVoter}
      variant={{ type: 'number', min: 1 }}
    />
  </FormField>

  <FormField title="Maximum votes per project*">
    <TextInput
      placeholder="100"
      validationState={maxVotesPerProjectValidationState}
      bind:value={maxVotesPerProject}
      variant={{ type: 'number', min: 1 }}
    />
  </FormField>

  <!-- TODO(rpgf): CSV Upload for badgeholders -->
  <FormField title="Badgeholders" description="These addresses will be able to vote in the round.">
    <ListEditor
      bind:items={voterItems}
      allowDripLists={false}
      allowProjects={false}
      weightsMode={false}
    />
  </FormField>
</RpgfSettingsForm>
