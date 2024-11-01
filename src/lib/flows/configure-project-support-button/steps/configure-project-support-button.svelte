<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Pencil from '$lib/components/icons/✏️.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import Button from '$lib/components/button/button.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Setting from '../../../../routes/(pages)/app/(app)/settings/components/setting.svelte';

  const headline = 'Configure your embed code';
  const description = 'Choose how you want your support button to be displayed.';

  function onClickCopy() {}

  function onClickCancel() {}
</script>

<StepLayout>
  <div class="configure-project-support-button">
    <div class="icon">
      <Pencil size={48} />
    </div>
    <StepHeader {headline} {description} />
    <div class="section">
      <Divider />
      <h4 class="typo-all-caps">Style</h4>
      <Setting title="Background" subtitle="The background">
        <SegmentedControl
          active="auto"
          options={[
            {
              title: 'Dark',
              value: 'auto',
            },
            {
              title: 'Light',
              value: 'light',
            },
            {
              title: 'Blue',
              value: 'dark',
            },
          ]}
        />
      </Setting>
      <Setting title="Button text" subtitle="Show project, me, or us">
        <SegmentedControl
          active="auto"
          options={[
            {
              title: 'Project',
              value: 'auto',
            },
            {
              title: 'Me',
              value: 'light',
            },
            {
              title: 'Us',
              value: 'dark',
            },
          ]}
        />
      </Setting>
      <Setting title="Style" subtitle="The general styling">
        <SegmentedControl
          active="auto"
          options={[
            {
              title: 'Github',
              value: 'auto',
            },
            {
              title: 'Drips',
              value: 'light',
            },
          ]}
        />
      </Setting>
      <Setting title="Stat" subtitle="The live-updated stat">
        <SegmentedControl
          active="auto"
          options={[
            {
              title: 'Support',
              value: 'auto',
            },
            {
              title: 'Dependencies',
              value: 'light',
            },
            {
              title: 'None',
              value: 'light',
            },
          ]}
        />
      </Setting>
      <Divider />
    </div>
    <div class="section">
      <h4 class="typo-all-caps">Preview</h4>
    </div>
  </div>

  <svelte:fragment slot="left-actions">
    <Button on:click={onClickCancel}>Never mind</Button>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <Button variant="primary" icon={CopyIcon} on:click={onClickCopy}>Copy embed code</Button>
  </svelte:fragment>
</StepLayout>

<style>
  .configure-project-support-button .icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  .configure-project-support-button .section {
    text-align: left;
  }
</style>
