<script lang="ts">
  import StepHeader from '$lib/components/step-header/step-header.svelte';
  import StepLayout from '$lib/components/step-layout/step-layout.svelte';
  import Pencil from '$lib/components/icons/✏️.svelte';
  import CopyIcon from '$lib/components/icons/Copy.svelte';
  import Button from '$lib/components/button/button.svelte';
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Setting from '../../../../routes/(pages)/app/(app)/settings/components/setting.svelte';
  import {
    SupportButtonBackground,
    SupportButtonStat,
    SupportButtonStyle,
    SupportButtonText,
    type SupportButtonData,
    type SupportButtonOptions,
  } from '$lib/components/project-support-button/project-support-button';
  import toTitleCase from '$lib/utils/title-case';
  import modal from '$lib/stores/modal/index';
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';
  import CopyLinkButton from '$lib/components/copy-link-button/copy-link-button.svelte';
  import CheckCircleIcon from '$lib/components/icons/CheckCircle.svelte';

  export let supportButtonData: SupportButtonData;
  export let projectSourceUrl: string;

  const headline = 'Configure your embed code';
  const description = 'Choose how you want your support button to be displayed.';

  type Options<T> = Array<{ title: string; value: T[keyof T] }>;
  function createOptions<T extends { [key: string]: string }>(
    options: T,
    skipKey: string = 'default',
  ): Options<T> {
    return Object.entries(options).reduce((memo, [key, value]) => {
      if (key !== skipKey) {
        memo.push({
          title: toTitleCase(key),
          value: value as T[keyof T],
        });
      }

      return memo;
    }, [] as Options<T>);
  }

  const backgrounds = createOptions(SupportButtonBackground);
  const styles = createOptions(SupportButtonStyle);
  const texts = createOptions(SupportButtonText);
  const stats = createOptions(SupportButtonStat);

  const selection: SupportButtonOptions = {
    background: SupportButtonBackground.default,
    style: SupportButtonStyle.default,
    text: SupportButtonText.default,
    stat: SupportButtonStat.default,
  };

  function makeOnSelect<K extends keyof SupportButtonOptions>(prop: K) {
    return function <T extends CustomEvent>(event: T) {
      selection[prop] = event.detail;
    };
  }

  function getSupportPngUrl(selection: SupportButtonOptions, projectSourceUrl: string) {
    const params = new URLSearchParams(selection);
    return `${window.location.origin}/api/embed/project/${encodeURIComponent(projectSourceUrl)}/support.png?${params}`;
  }

  function generateEmbedCode(
    selection: SupportButtonOptions,
    projectSourceUrl: string,
    supportButtonData: SupportButtonData,
  ) {
    const supportPngUrl = getSupportPngUrl(selection, projectSourceUrl);
    // TODO: better matching alt? "Drip to me" is maybe too vague though.
    const imgAlt = `Support ${supportButtonData.projectName} on drips.network`;
    const imgHeight = selection.style === SupportButtonStyle.github ? 20 : 32;

    return `<a href="${supportButtonData.projectUrl}" target="_blank"><img src="${supportPngUrl}" alt="${imgAlt}" height="${imgHeight}"></a>`;
  }

  function onClickCancel() {
    modal.hide();
  }

  $: backgroundDisabled = selection.style === SupportButtonStyle.github;
  $: embedCode = generateEmbedCode(selection, projectSourceUrl, supportButtonData);
</script>

<StepLayout>
  <div class="configure-project-support-button">
    <div class="icon">
      <Pencil size={48} />
    </div>
    <StepHeader {headline} {description} />
    <Divider />
    <div class="configure-project-support-button__section section">
      <h4 class="typo-all-caps">Style</h4>
      <Setting title="Style" subtitle="The general styling">
        <SegmentedControl
          active={selection.style}
          on:select={makeOnSelect('style')}
          options={styles}
        />
      </Setting>
      <Setting disabled={backgroundDisabled} title="Background" subtitle="The background">
        <SegmentedControl
          disabled={backgroundDisabled}
          active={selection.background}
          on:select={makeOnSelect('background')}
          options={backgrounds}
        />
      </Setting>
      <Setting title="Button text" subtitle="Show project, me, or us">
        <SegmentedControl
          active={selection.text}
          on:select={makeOnSelect('text')}
          options={texts}
        />
      </Setting>
      <Setting title="Stat" subtitle="The live-updated stat">
        <SegmentedControl
          active={selection.stat}
          on:select={makeOnSelect('stat')}
          options={stats}
        />
      </Setting>
      <Divider />
    </div>
    <div class="configure-project-support-button__section section">
      <h4 class="typo-all-caps">Preview</h4>
      <div class="configure-project-support-button_preview">
        <ProjectSupportButton data={supportButtonData} options={selection} />
      </div>
    </div>
  </div>

  <svelte:fragment slot="left-actions">
    <Button on:click={onClickCancel}>Never mind</Button>
  </svelte:fragment>

  <svelte:fragment slot="actions">
    <CopyLinkButton url={embedCode} variant="primary">
      Copy embed code
      <svelte:fragment slot="idle">
        <CopyIcon style="fill: currentColor" />
      </svelte:fragment>
      <!-- hover is the same as idle in this case -->
      <svelte:fragment slot="success">
        <CheckCircleIcon style="fill: currentColor" />
      </svelte:fragment>
    </CopyLinkButton>
  </svelte:fragment>
</StepLayout>

<style>
  .configure-project-support-button {
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
  }

  .configure-project-support-button .icon {
    display: flex;
    justify-content: center;
  }

  .configure-project-support-button__section {
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .configure-project-support-button_preview {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem 0px 1rem 1rem;
    border: 1px solid var(--color-foreground);
    background-color: var(--color-foreground-level-1);
    color: var(--color-background);
    height: 120px;
  }
</style>
