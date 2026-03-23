<script lang="ts">
  import { goto } from '$app/navigation';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import Button from '$lib/components/button/button.svelte';
  import ArrowLeft from '$lib/components/icons/ArrowLeft.svelte';
  import ArrowRight from '$lib/components/icons/ArrowRight.svelte';
  import ListSelect from '$lib/components/list-select/list-select.svelte';
  import type { Items } from '$lib/components/list-select/list-select.types';
  import Card from '$lib/components/wave/card/card.svelte';
  import RepoBadge from '$lib/components/wave/repo-badge/repo-badge.svelte';
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
      data.ownRepos
        .sort((a, b) => a.gitHubRepoFullName.localeCompare(b.gitHubRepoFullName))
        .map((repo) => [
          repo.id,
          {
            type: 'selectable',
            label: {
              component: RepoBadge,
              props: {
                repo,
                avatarUrl: data.ownOrgs.data.find((org) => org.org.id === repo.orgId)?.org
                  .gitHubOrgAvatarUrl,
              },
            },
            disabled: checkAlreadyApplied(repo.id),
            text: checkAlreadyApplied(repo.id) ? 'Already applied' : undefined,
            searchString: repo.gitHubRepoFullName,
          },
        ]),
    ),
  );

  let selected = $state<string[]>([]);

  const STORAGE_KEY = `wave-apply-repos-${data.waveProgram.id}`;

  function handleContinue() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(selected));
    goto(`/wave/maintainer-onboarding/apply-to-wave-program/${data.waveProgram.id}/form`);
  }
</script>

<FlowStepWrapper
  headline="Pick repos to apply"
  description="Choose which repos you'd like to apply to the {data.waveProgram.name} Wave Program."
>
  <AnnotationBox>
    Please apply related repos (e.g. backend, frontend, contracts for the same product) together.
    You'll answer a few questions about them in the next step.
  </AnnotationBox>

  <Card style="padding: 0; text-align: left; width: 100%;">
    <ListSelect multiselect maxSelected={10} {items} bind:selected />
  </Card>

  {#snippet leftActions()}
    <Button icon={ArrowLeft} href="/wave/maintainer-onboarding/apply-to-wave-program"
      >Choose Wave Program</Button
    >
  {/snippet}

  {#snippet actions()}
    <Button
      variant="primary"
      disabled={selected.length === 0}
      icon={ArrowRight}
      onclick={handleContinue}>Continue</Button
    >
  {/snippet}
</FlowStepWrapper>
