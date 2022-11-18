<script lang="ts">
  import SegmentedControl from 'radicle-design-system/SegmentedControl.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Setting from './components/setting.svelte';
  import themeStore, { type Theme } from '$lib/stores/theme/theme.store';

  // Theme control
  let selectedTheme: 'auto' | Theme = $themeStore.selectedTheme;
  $: themeStore.selectTheme(selectedTheme);
</script>

<svelte:head>
  <title>Settings | Drips</title>
  <meta name="description" value="Drips Settings Page" />
</svelte:head>

<div class="settings">
  <div class="header">
    <h1>Settings</h1>
    <p>All preferences below are stored locally on your device.</p>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Appearance</h4>
    <Setting title="Theme" subtitle="Adjust the appearance of UI elements across the app.">
      <SegmentedControl
        active={selectedTheme}
        on:select={(value) => {
          selectedTheme = value.detail;
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
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Get in touch</h4>
    <Setting title="Join the discussion" subtitle="Join our Discord to chat with the team.">
      <a class="typo-link" target="_blank" href="https://discord.gg/vhGXkazpNc"
        >Open Discord Server</a
      >
    </Setting>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Advanced</h4>
    <Setting
      title="Build on Drips"
      subtitle="The Drips protocol is fully open-source and ready for you to build on."
    >
      <a class="typo-link" target="_blank" href="https://v2.docs.drips.network">Read the docs</a>
    </Setting>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Open Source Licenses</h4>
    <Setting
      title="Twemoji"
      subtitle="Copyright 2020 Twitter, Inc and other contributors. Licensed under CC-BY 4.0."
    />
    <Setting
      title="Inter"
      subtitle="Font by Rasmus Andersson licensed under the SIL Open Font License 1.1."
    />
    <Setting
      title="Source Code Pro"
      subtitle="Font by Adobe Fonts distributed under the SIL Open Font License."
    />
  </div>
</div>

<style>
  .settings {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  p {
    color: var(--color-foreground-level-6);
  }

  h4 {
    color: var(--color-foreground-level-5);
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
</style>
