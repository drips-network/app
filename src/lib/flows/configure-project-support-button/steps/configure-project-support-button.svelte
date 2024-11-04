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

  export let supportButtonData: SupportButtonData;

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

  $: backgroundDisabled = selection.style === SupportButtonStyle.github;

  function makeOnSelect<K extends keyof SupportButtonOptions>(prop: K) {
    return function <T extends CustomEvent>(event: T) {
      selection[prop] = event.detail;
    };
  }

  function onClickCopy() {}

  function onClickCancel() {
    modal.hide();
  }
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
      <div class="configure-project-support-button_preview">insert the button here</div>
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
    border: 1px 0px 0px 0px;
    padding: 44px 46px;
    background-color: var(--color-foreground);
    color: var(--color-background);
  }
</style>
