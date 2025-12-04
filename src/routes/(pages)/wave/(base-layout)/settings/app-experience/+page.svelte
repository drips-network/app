<script>
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Setting from '$lib/components/setting/setting.svelte';
  import animationsStore from '$lib/stores/animations/animations.store';
  import themeStore from '$lib/stores/theme/theme.store';

  const { primaryColor } = themeStore;
  const { selectedSetting: animationsSetting } = animationsStore;
</script>

<Setting title="Theme" subtitle="Adjust the appearance of UI elements across the app.">
  <SegmentedControl
    active={$themeStore.selectedTheme}
    on:select={(value) => {
      themeStore.selectTheme(value.detail);
    }}
    options={[
      {
        title: 'Auto',
        value: 'auto',
      },
      {
        title: 'Light',
        value: 'light',
      },
      {
        title: 'Dark',
        value: 'dark',
      },
      {
        title: 'h4x0r',
        value: 'h4x0r',
      },
    ]}
  />
</Setting>
<Setting title="Primary color" subtitle="Adjust the primary color of UI elements within the app.">
  <SegmentedControl
    active={$primaryColor}
    on:select={(value) => {
      themeStore.selectPrimaryColor(value.detail);
    }}
    options={[
      {
        title: 'Default',
        value: 'default',
      },
      {
        title: 'Blue',
        value: 'blue',
      },
      {
        title: 'Red',
        value: 'red',
      },
      {
        title: 'Orange',
        value: 'orange',
      },
      {
        title: 'Pink',
        value: 'pink',
      },
    ]}
  />
</Setting>
<Setting
  title="View transitions"
  subtitle="Enable smooth transitions while navigating. 'Auto' follows the system setting."
>
  <SegmentedControl
    active={$animationsSetting}
    on:select={(value) => {
      animationsSetting.set(value.detail);
    }}
    options={[
      {
        title: 'Auto',
        value: 'auto',
      },
      {
        title: 'On',
        value: 'on',
      },
      {
        title: 'Off',
        value: 'off',
      },
    ]}
  />
</Setting>
