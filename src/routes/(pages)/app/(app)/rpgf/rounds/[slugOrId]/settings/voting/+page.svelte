<script lang="ts">
  import { run } from 'svelte/legacy';

  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Items } from '$lib/components/list-editor/types';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { getAddress } from 'ethers';
  import type { PatchRoundDto } from '$lib/utils/rpgf/types/round';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import { areStringArraysEqual } from '$lib/utils/compare-string-array';
  import { setRoundVoters, updateRound } from '$lib/utils/rpgf/rpgf';

  let { data } = $props();

  let updatedRound: PatchRoundDto = $state({ ...data.round });
  let updatedVoterAddresses: string[] = $state([
    ...data.roundVoters.map((u) => getAddress(u.walletAddress)),
  ]);

  let isDraft = $derived(!data.round.published);

  // TODO(rpgf): use address driver account IDs as item keys, not addresses
  let voterItems: Items = $state(Object.fromEntries(
    data.roundVoters.map((u) => {
      return [
        getAddress(u.walletAddress),
        {
          type: 'address',
          address: getAddress(u.walletAddress),
        },
      ];
    }) ?? [],
  ));

  run(() => {
    updatedVoterAddresses = mapFilterUndefined(
      Object.values(voterItems).map((item) => {
        if (item.type === 'address') {
          return getAddress(item.address);
        } else {
          return undefined;
        }
      }),
      (v) => v,
    );
  });

  let votesPerVoterValidationState = $state<TextInputValidationState>({ type: 'unvalidated' });
  run(() => {
    if (!updatedRound.maxVotesPerVoter) {
      votesPerVoterValidationState = { type: 'unvalidated' };
    } else if (updatedRound.maxVotesPerVoter < 1) {
      votesPerVoterValidationState = { type: 'invalid', message: 'Must be at least 1' };
    } else if (
      updatedRound.minVotesPerProjectPerVoter &&
      Number(updatedRound.maxVotesPerVoter) < Number(updatedRound.minVotesPerProjectPerVoter)
    ) {
      votesPerVoterValidationState = {
        type: 'invalid',
        message: `Must be at least ${Number(updatedRound.minVotesPerProjectPerVoter)} (minimum votes per project)`,
      };
    } else if (
      updatedRound.maxVotesPerProjectPerVoter &&
      Number(updatedRound.maxVotesPerVoter) < Number(updatedRound.maxVotesPerProjectPerVoter)
    ) {
      votesPerVoterValidationState = {
        type: 'invalid',
        message: `Must be at least ${Number(updatedRound.maxVotesPerProjectPerVoter)} (maximum votes per project)`,
      };
    } else {
      votesPerVoterValidationState = { type: 'valid' };
    }
  });

  let maxVotesPerProjectValidationState = $state<TextInputValidationState>({ type: 'unvalidated' });
  run(() => {
    if (!updatedRound.maxVotesPerProjectPerVoter) {
      maxVotesPerProjectValidationState = { type: 'unvalidated' };
    } else if (updatedRound.maxVotesPerProjectPerVoter < 1) {
      maxVotesPerProjectValidationState = { type: 'invalid', message: 'Must be at least 1' };
    } else if (
      updatedRound.minVotesPerProjectPerVoter &&
      Number(updatedRound.maxVotesPerProjectPerVoter) <
        Number(updatedRound.minVotesPerProjectPerVoter)
    ) {
      maxVotesPerProjectValidationState = {
        type: 'invalid',
        message: 'Must be equal or higher than min votes per project',
      };
    } else if (
      updatedRound.maxVotesPerVoter &&
      Number(updatedRound.maxVotesPerProjectPerVoter) > Number(updatedRound.maxVotesPerVoter)
    ) {
      maxVotesPerProjectValidationState = {
        type: 'invalid',
        message: 'Must be equal or lower than votes per voter',
      };
    } else {
      maxVotesPerProjectValidationState = { type: 'valid' };
    }
  });

  let minVotesPerProjectValidationState = $state<TextInputValidationState>({ type: 'unvalidated' });
  run(() => {
    if (!updatedRound.minVotesPerProjectPerVoter) {
      minVotesPerProjectValidationState = { type: 'unvalidated' };
    } else if (updatedRound.minVotesPerProjectPerVoter < 1) {
      minVotesPerProjectValidationState = { type: 'invalid', message: 'Must be at least 1' };
    } else if (
      updatedRound.maxVotesPerProjectPerVoter &&
      Number(updatedRound.minVotesPerProjectPerVoter) >
        Number(updatedRound.maxVotesPerProjectPerVoter)
    ) {
      minVotesPerProjectValidationState = {
        type: 'invalid',
        message: 'Must be equal or lower than max votes per project',
      };
    } else if (
      updatedRound.maxVotesPerVoter &&
      Number(updatedRound.minVotesPerProjectPerVoter) > Number(updatedRound.maxVotesPerVoter)
    ) {
      minVotesPerProjectValidationState = {
        type: 'invalid',
        message: 'Must be equal or lower than votes per voter',
      };
    } else {
      minVotesPerProjectValidationState = { type: 'valid' };
    }
  });

  // Voters can not be updated after voting has started
  let canUpdateVoters = $derived(data.round.state
    ? data.round.state !== 'pending-results' &&
      data.round.state !== 'results' &&
      data.round.state !== 'voting'
    : true);

  let voterGuidelinesLinkValidationState = $state<TextInputValidationState>({ type: 'valid' });
  run(() => {
    if (!updatedRound.voterGuidelinesLink) {
      voterGuidelinesLinkValidationState = { type: 'valid' };
    } else if (!/^https?:\/\//.test(updatedRound.voterGuidelinesLink)) {
      voterGuidelinesLinkValidationState = {
        type: 'invalid',
        message: 'Must be a valid URL starting with http:// or https://',
      };
    } else {
      voterGuidelinesLinkValidationState = { type: 'valid' };
    }
  });

  let valid = $derived(Boolean(
    votesPerVoterValidationState.type !== 'invalid' &&
      maxVotesPerProjectValidationState.type !== 'invalid' &&
      minVotesPerProjectValidationState.type !== 'invalid' &&
      voterGuidelinesLinkValidationState.type !== 'invalid',
  ));

  let changesMade =
    $derived(updatedRound.maxVotesPerVoter !== data.round.maxVotesPerVoter ||
    updatedRound.maxVotesPerProjectPerVoter !== data.round.maxVotesPerProjectPerVoter ||
    updatedRound.minVotesPerProjectPerVoter !== data.round.minVotesPerProjectPerVoter ||
    updatedRound.voterGuidelinesLink !== data.round.voterGuidelinesLink ||
    !areStringArraysEqual(
      updatedVoterAddresses.map((a) => a.toLowerCase()).sort(),
      data.roundVoters.map((u) => u.walletAddress.toLowerCase()).sort(),
    ));

  function normalizeOptionalNumberInput(value: unknown): number | null {
    if (value === '' || value === null || value === undefined) {
      return null;
    }

    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return null;
    }

    return parsed;
  }

  async function saveHandler() {
    const maxVotesPerVoter = normalizeOptionalNumberInput(updatedRound.maxVotesPerVoter);
    const maxVotesPerProject = normalizeOptionalNumberInput(
      updatedRound.maxVotesPerProjectPerVoter,
    );
    const minVotesPerProject = normalizeOptionalNumberInput(
      updatedRound.minVotesPerProjectPerVoter,
    );

    await updateRound(undefined, data.round.id, {
      maxVotesPerVoter,
      maxVotesPerProjectPerVoter: maxVotesPerProject ?? null,
      minVotesPerProjectPerVoter: minVotesPerProject ?? null,
      voterGuidelinesLink: updatedRound.voterGuidelinesLink,
    });

    updatedRound = {
      ...updatedRound,
      maxVotesPerVoter,
      maxVotesPerProjectPerVoter: maxVotesPerProject,
      minVotesPerProjectPerVoter: minVotesPerProject,
    };

    if (canUpdateVoters) {
      await setRoundVoters(undefined, data.round.id, updatedVoterAddresses);
    }
  }
</script>

<RpgfSettingsForm invalid={!valid} saveEnabled={changesMade} {saveHandler}>
  {#if !isDraft}
    <div style:align-self="flex-start">
      <AnnotationBox>
        You can no longer change the votes per voter or per-project vote limits for an ongoing,
        published round.
      </AnnotationBox>
    </div>
  {/if}

  <FormField
    title="Votes per voter*"
    description="The maximum amount of votes that each badgeholder may allocate across all projects."
    disabled={!isDraft}
  >
    <TextInput
      placeholder="1000"
      validationState={votesPerVoterValidationState}
      bind:value={updatedRound.maxVotesPerVoter}
      variant={{ type: 'number', min: 1 }}
    />
  </FormField>

  <FormField
    title="Minimum votes per project"
    description="The minimum amount of votes that a badgeholder must allocate to any project they include on their ballot."
    disabled={!isDraft}
  >
    <TextInput
      placeholder="10"
      validationState={minVotesPerProjectValidationState}
      bind:value={updatedRound.minVotesPerProjectPerVoter}
      variant={{ type: 'number', min: 1 }}
    />
  </FormField>

  <FormField
    title="Maximum votes per project"
    description="The maximum amount of votes any given badgeholder may allocate to a single project."
    disabled={!isDraft}
  >
    <TextInput
      placeholder="100"
      validationState={maxVotesPerProjectValidationState}
      bind:value={updatedRound.maxVotesPerProjectPerVoter}
      variant={{ type: 'number', min: 1 }}
    />
  </FormField>

  <FormField
    title="Badgeholder guidelines link"
    description="Optionally set a link that badgeholders need to read and accept before being able to cast their ballot."
  >
    <TextInput
      placeholder="http://example.com/guidelines"
      validationState={voterGuidelinesLinkValidationState}
      bind:value={updatedRound.voterGuidelinesLink}
    />
  </FormField>

  <!-- TODO(rpgf): CSV Upload for badgeholders -->
  <FormField
    title="Badgeholders"
    description="These addresses will be able to vote in the round."
    disabled={!canUpdateVoters}
  >
    <ListEditor
      bind:items={voterItems}
      allowDripLists={false}
      allowProjects={false}
      weightsMode={false}
    />
  </FormField>
</RpgfSettingsForm>
