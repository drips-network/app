<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Button from '$lib/components/button/button.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { getUser } from '$lib/utils/wave/users';
  import { adjustPoints } from '$lib/utils/wave/points';

  let { data } = $props();

  const initialProgramId = data.wavePrograms[0]?.id;
  const initialWaves = initialProgramId ? (data.wavesByProgram[initialProgramId] ?? []) : [];
  const latestWave =
    initialWaves.length > 0
      ? initialWaves.reduce((a, b) => (a.waveNumber > b.waveNumber ? a : b))
      : undefined;

  let gitHubUsername = $state('');
  let points = $state<number | null>(null);
  let waveProgramId = $state<string | undefined>(initialProgramId);
  let waveId = $state<string | undefined>(latestWave?.id);
  let reason = $state('');
  let submitting = $state(false);

  let waveOptions = $derived(
    waveProgramId
      ? (data.wavesByProgram[waveProgramId] ?? []).map((w) => ({
          value: w.id,
          title: `Wave ${w.waveNumber}`,
        }))
      : [],
  );

  let waveProgramOptions = $derived(
    data.wavePrograms.map((p) => ({
      value: p.id,
      title: p.name,
    })),
  );

  let valid = $derived(
    gitHubUsername.trim().length > 0 &&
      points !== null &&
      points !== 0 &&
      waveProgramId !== undefined &&
      waveId !== undefined &&
      reason.trim().length >= 15,
  );

  function resetForm() {
    gitHubUsername = '';
    points = null;
    reason = '';
  }

  async function handleSubmit() {
    if (!valid || !waveId) return;

    const trimmedUsername = gitHubUsername.trim();
    const pointsValue = points!;

    submitting = true;

    try {
      const user = await doWithErrorModal(() => getUser(fetch, trimmedUsername));

      if (!user) {
        throw new Error(`User "${trimmedUsername}" not found.`);
      }

      const action = pointsValue > 0 ? 'add' : 'deduct';
      const message = `You are about to ${action} ${Math.abs(pointsValue)} points ${pointsValue > 0 ? 'to' : 'from'} ${trimmedUsername}'s account. Reason: ${reason.trim()}`;

      await doWithConfirmationModal(message, async () => {
        await doWithErrorModal(
          () =>
            adjustPoints(fetch, {
              userId: user.id,
              points: pointsValue,
              reason: reason.trim(),
              waveId: waveId!,
            }),
          undefined,
          { message: 'Points adjusted successfully.', confetti: false },
        );
        resetForm();
      });
    } catch {
      // Error already handled by doWithErrorModal
    } finally {
      submitting = false;
    }
  }
</script>

<HeadMeta title="Adjust Points | Admin | Wave" />

<div class="page">
  <Breadcrumbs crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Adjust Points' }]} />
  <Section
    header={{
      label: 'Adjust Points',
    }}
    skeleton={{ loaded: true }}
  >
    <div class="form">
      <FormField title="GitHub Username">
        <TextInput bind:value={gitHubUsername} placeholder="e.g. octocat" />
      </FormField>

      <FormField
        title="Points"
        description="Positive to add, negative to deduct. Must be non-zero."
      >
        <TextInput
          bind:value={points}
          variant={{ type: 'number', min: -999999 }}
          placeholder="e.g. 100 or -50"
        />
      </FormField>

      <FormField title="Wave Program">
        <Dropdown
          options={waveProgramOptions}
          bind:value={waveProgramId}
          onchange={() => {
            waveId = undefined;
          }}
        />
      </FormField>

      <FormField title="Wave" disabled={!waveProgramId}>
        <Dropdown options={waveOptions} bind:value={waveId} disabled={!waveProgramId} />
      </FormField>

      <FormField title="Reason" description="Min 15 characters.">
        <TextArea bind:value={reason} placeholder="Describe the reason for this adjustment..." />
      </FormField>

      <Button disabled={!valid || submitting} onclick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Submit Adjustment'}
      </Button>
    </div>
  </Section>
</div>

<style>
  .page {
    display: flex;
    max-width: 90rem;
    margin: 0 auto;
    width: 100%;
    flex-direction: column;
    gap: 1.5rem;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-width: 32rem;
    margin: 0 auto;
  }
</style>
