<script lang="ts">
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import Breadcrumbs from '$lib/components/breadcrumbs/breadcrumbs.svelte';
  import Section from '$lib/components/section/section.svelte';
  import FormField from '$lib/components/form-field/form-field.svelte';
  import Dropdown from '$lib/components/dropdown/dropdown.svelte';
  import Button from '$lib/components/button/button.svelte';
  import AnnotationBox from '$lib/components/annotation-box/annotation-box.svelte';
  import doWithConfirmationModal from '$lib/utils/do-with-confirmation-modal';
  import doWithErrorModal from '$lib/utils/do-with-error-modal';
  import { pushWaveIntercomSegments } from '$lib/utils/wave/admin/intercom-segments';

  let { data } = $props();

  const initialProgramId = data.wavePrograms[0]?.id;
  const initialWaves = initialProgramId ? (data.wavesByProgram[initialProgramId] ?? []) : [];
  const latestWave =
    initialWaves.length > 0
      ? initialWaves.reduce((a, b) => (a.waveNumber > b.waveNumber ? a : b))
      : undefined;

  let waveProgramId = $state<string | undefined>(initialProgramId);
  let waveId = $state<string | undefined>(latestWave?.id);
  let submitting = $state(false);

  let waveProgramOptions = $derived(
    data.wavePrograms.map((p) => ({
      value: p.id,
      title: p.name,
    })),
  );

  let waveOptions = $derived(
    waveProgramId
      ? (data.wavesByProgram[waveProgramId] ?? []).map((w) => ({
          value: w.id,
          title: `Wave ${w.waveNumber}`,
        }))
      : [],
  );

  let selectedProgram = $derived(data.wavePrograms.find((p) => p.id === waveProgramId));
  let selectedWave = $derived(
    waveProgramId
      ? (data.wavesByProgram[waveProgramId] ?? []).find((w) => w.id === waveId)
      : undefined,
  );

  let valid = $derived(waveProgramId !== undefined && waveId !== undefined);

  async function handleSubmit() {
    if (!valid || !waveId || !selectedProgram || !selectedWave) return;

    const targetWaveId = waveId;
    const message =
      `You are about to push Intercom segments for Wave ${selectedWave.waveNumber} of ${selectedProgram.name}. ` +
      `This enqueues a background job that tags every contributor (net positive points) and repo maintainer for the wave on Intercom. ` +
      `Continue?`;

    submitting = true;

    try {
      await doWithConfirmationModal(message, async () => {
        await doWithErrorModal(() => pushWaveIntercomSegments(fetch, targetWaveId), undefined, {
          message: 'Intercom segment push enqueued.',
          confetti: false,
        });
      });
    } catch {
      // Error already handled by doWithErrorModal
    } finally {
      submitting = false;
    }
  }
</script>

<HeadMeta title="Intercom Wave Segments | Admin | Wave" />

<div class="page">
  <Breadcrumbs
    crumbs={[{ label: 'Admin', href: '/wave/admin' }, { label: 'Intercom Wave Segments' }]}
  />
  <Section
    header={{
      label: 'Intercom Wave Segments',
    }}
    skeleton={{ loaded: true }}
  >
    <div class="form">
      <AnnotationBox type="info">
        Enqueues a background job that tags every qualifying user on Intercom with the wave's
        Contributor and Repo Maintainer tags. Tagging is idempotent — running this multiple times is
        safe.
      </AnnotationBox>

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

      <Button disabled={!valid || submitting} onclick={handleSubmit}>
        {submitting ? 'Submitting...' : 'Push to Intercom'}
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
