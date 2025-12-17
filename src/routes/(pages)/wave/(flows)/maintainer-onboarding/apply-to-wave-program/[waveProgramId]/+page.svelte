<script lang="ts">
  import { goto, invalidate } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
  import doBatchWithErrorModal from '$lib/utils/make-batch-call-with-error-modal';
  import { applyRepoToWaveProgram } from '$lib/utils/wave/wavePrograms';
  import FlowStepWrapper from '../../../shared/flow-step-wrapper.svelte';

  let { data } = $props();

  function checkAlreadyApplied(repoId: string) {
    return data.ownWaveProgramRepos.data.some(
      (ownWaveProgramRepo) =>
        ownWaveProgramRepo.repo.id === repoId &&
        ownWaveProgramRepo.waveProgramId === data.waveProgram.id,
    );
  }

  let items = $derived<Items>(
    Object.fromEntries(
      data.ownRepos.data
        .sort((a, b) => a.gitHubRepoFullName.localeCompare(b.gitHubRepoFullName))
        .map((repo) => [
          repo.id,
          {
            type: 'selectable',
            label: {
              component: RepoBadge,
              props: { repo },
            },
            disabled: checkAlreadyApplied(repo.id),
            text: checkAlreadyApplied(repo.id) ? 'Already applied' : undefined,
            searchString: repo.gitHubRepoFullName,
          },
        ]),
    ),
  );

  let selected = $state<string[]>([]);
  let applying = $state(false);

  async function handleApply() {
    applying = true;

    const result = await doBatchWithErrorModal(
      selected.map((repoId) => async () => {
        try {
          await applyRepoToWaveProgram(undefined, data.waveProgram.id, repoId);
        } catch (e) {
          return {
            success: false,
            errorMessage: `Failed to apply repo ID ${repoId} to wave: ${(e as Error).message}`,
            error: e,
          };
        }

        return {
          success: true,
        };
      }),
    );

    applying = false;
    selected = [];

    if (result.some((res) => !res.success)) {
      await invalidate('wave:maintainer-onboarding-apply-to-wave');
      return;
    } else {
      goto(`/wave/maintainer-onboarding/apply-to-wave-program/${data.waveProgram.id}/success`);
    }
  }
</script>

<FlowStepWrapper
  headline="Pick repos to apply"
  description="Choose which repos you’d like to apply to {data.waveProgram
    .name}. They must match the criteria set for the Wave Program in order to be eligible."
>
  <Card style="padding: 0; text-align: left; width: 100%;">
    <ListSelect multiselect {items} bind:selected />
  </Card>

  {#snippet leftActions()}
    <Button icon={ArrowLeft} href="/wave/maintainer-onboarding/apply-to-wave-program"
      >Choose Wave Program</Button
    >
  {/snippet}

  <AnnotationBox type="info">
    After you apply, we'll email you when your repos have been accepted into {data.waveProgram
      .name}. You can always check on the status of your applications on the maintainer dashboard.
  </AnnotationBox>

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={selected.length === 0}
      icon={CheckCircle}
      loading={applying}
      onclick={handleApply}>Apply selected repos</Button
    >
  {/snippet}
</FlowStepWrapper>
