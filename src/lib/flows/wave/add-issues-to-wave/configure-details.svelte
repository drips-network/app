<script lang="ts">
  import Button from '$lib/components/button/button.svelte';
  import StandaloneFlowStepLayout from '$lib/components/standalone-flow-step-layout/standalone-flow-step-layout.svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { createEventDispatcher } from 'svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import type { WaveDto, WaveRepoWithDetailsDto } from '$lib/utils/wave/types/wave';
  import type { IssueDetailsDto } from '$lib/utils/wave/types/issue';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Card from '$lib/components/wave/card/card.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import { addIssueToWave } from '$lib/utils/wave/waves';
  import { invalidate } from '$app/navigation';
  import { notifyIssuesUpdated } from '$lib/components/wave/issues-page/issue-update-coordinator';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import { getIssue } from '$lib/utils/wave/issues';
  import { getPointsForComplexity } from '$lib/utils/wave/get-points-for-complexity';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  let {
    waveRepos,
    waves,
    issues,
    onsuccess,
  }: {
    waveRepos: WaveRepoWithDetailsDto[];
    waves: WaveDto[];
    issues: IssueDetailsDto[];
    onsuccess?: () => void;
  } = $props();

  const pluralS = issues.length > 1 ? 's' : '';

  let eligibleIssues = $derived(
    issues
      .filter((issue) => !issue.waveId && issue.state === 'open')
      .filter((issue) => {
        const matchingWaveRepo = waveRepos.find(
          (waveRepo) => waveRepo.repo.id === issue.repo.id && waveRepo.status === 'approved',
        );
        return Boolean(matchingWaveRepo);
      }),
  );
  let hasIneligibleIssues = $derived(eligibleIssues.length < issues.length);

  async function handleSubmit() {
    dispatch('await', {
      message: `Adding issue${pluralS} to Wave…`,
      promise: async () => {
        const selectedWaveId = selectedWaveIds[0];

        const results = await Promise.allSettled(
          eligibleIssues.map((issue) =>
            addIssueToWave(undefined, selectedWaveId, issue.id, activeComplexity),
          ),
        );

        const failedResults = results.filter((result) => result.status === 'rejected');

        if (failedResults.length > 0) {
          // todo(wave): Make this error nicer and list out which issues failed
          throw new Error('Some issues could not be added to the Wave. Please try again.');
        }

        const updatedIssues = (
          await Promise.all(eligibleIssues.map((issue) => getIssue(undefined, issue.id)))
        ).filter((issue): issue is IssueDetailsDto => issue !== null);

        notifyIssuesUpdated(updatedIssues);
        await invalidate('wave:issues');

        onsuccess?.();
      },
    });
  }

  let activeComplexity: 'small' | 'medium' | 'large' = $state('small');

  let items = $derived<Items>(
    Object.fromEntries(
      waveRepos.map((waveRepo) => {
        const wave = waves.find((w) => w.id === waveRepo.waveId);
        if (!wave) throw new Error('Wave not found for WaveRepoWithDetailsDto');

        return [
          wave.id,
          {
            type: 'selectable',
            label: wave.name,
          },
        ];
      }),
    ),
  );

  let selectedWaveIds = $state<string[]>([]);

  let valid = $derived(selectedWaveIds.length > 0);
</script>

<StandaloneFlowStepLayout
  headline="Add issue{pluralS} to a Wave"
  description="Assign a complexity and select which Wave you'd like to add the issue{pluralS} to."
>
  <FormField
    title="Complexity*"
    description="This will be used to determine the points earned when closing {pluralS
      ? 'these issues'
      : 'this issue'}. You can update the complexity later."
    type="div"
  >
    <div style:width="max-content">
      <SegmentedControl
        bind:active={activeComplexity}
        options={[
          { title: 'Trivial', value: 'small' },
          { title: 'Medium', value: 'medium' },
          { title: 'High', value: 'large' },
        ]}
      />
    </div>
  </FormField>

  <FormField
    title="Points"
    description="The amount of Points earned for solving the issue{pluralS} is determined by the complexity you choose."
    type="div"
  >
    <span class="typo-text complexity-calc">
      <span style:color="var(--color-foreground-level-5)">
        100 <span class="typo-text-bold">Base Points</span> + {getPointsForComplexity(
          activeComplexity,
        )} <span class="typo-text-bold">Complexity Bonus</span> =
      </span>
      <span class="typo-text-bold">{100 + getPointsForComplexity(activeComplexity)} Points</span>
    </span>
  </FormField>

  <FormField
    title="Wave*"
    description="Choose which Wave you'd like to add the issue{pluralS} to."
    type="div"
  >
    <Card style="padding: 0; text-align: left; width: 100%;">
      <ListSelect {items} bind:selected={selectedWaveIds} />
    </Card>
  </FormField>

  {#if hasIneligibleIssues}
    <AnnotationBox>
      Some selected issues are already part of a Wave, or are not currently open. To add an issue to
      a different Wave, please remove it from its current Wave first.
    </AnnotationBox>
  {/if}

  {#snippet actions()}
    <Button variant="primary" disabled={!valid} icon={CheckCircle} onclick={handleSubmit}
      >Add issue{pluralS} to Wave</Button
    >
  {/snippet}
</StandaloneFlowStepLayout>

<style>
  .complexity-calc {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    background-color: var(--color-foreground-level-1);
    width: fit-content;
    padding: 0.5rem 1rem;
    border-radius: 2rem 0 2rem 2rem;
  }
</style>
