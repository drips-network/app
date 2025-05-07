<script lang="ts">
  import SegmentedControl from '$lib/components/segmented-control/segmented-control.svelte';
  import Divider from '$lib/components/divider/divider.svelte';
  import Setting from './components/setting.svelte';
  import ListIcon from '$lib/components/icons/Ledger.svelte';
  import themeStore from '$lib/stores/theme/theme.store';
  import Button from '$lib/components/button/button.svelte';
  import EyeOpen from '$lib/components/icons/EyeOpen.svelte';
  import dismissablesStore from '$lib/stores/dismissables/dismissables.store';
  import amtDeltaUnitStore from '$lib/stores/amt-delta-unit/amt-delta-unit.store';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import tickStore from '$lib/stores/tick/tick.store';
  import HeadMeta from '$lib/components/head-meta/head-meta.svelte';
  import { goto } from '$app/navigation';
  import developerModeStore from '$lib/stores/developer-mode/developer-mode.store';
  import gaslessStore from '$lib/stores/gasless/gasless.store';
  import network from '$lib/stores/wallet/network';
  import { INBOUND_LEAD_FORM_URL } from '$lib/constants';

  const { primaryColor } = themeStore;

  // Tick control
  const { slowMode } = tickStore;
  $: slowModeEnabled = $slowMode;
  $: tickStore.setSlowMode(slowModeEnabled);
</script>

<HeadMeta title="Settings" />

<div class="settings">
  <div class="header">
    <h1>Settings</h1>
    <p>All preferences below are stored locally on your device.</p>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Display</h4>
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
    <Setting
      title="Primary color"
      subtitle="Adjust the primary color of UI elements within the app."
    >
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
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Streams</h4>
    <Setting
      title="Amounts per time unit"
      subtitle="Choose which time unit amount deltas should be shown in throughout the app. Months are normalized as 30 days, years as 365 days."
    >
      <SegmentedControl
        active={$amtDeltaUnitStore}
        on:select={(value) => amtDeltaUnitStore.set(value.detail)}
        options={[
          {
            title: 'Sec',
            value: 'sec',
          },
          {
            title: 'Min',
            value: 'min',
          },
          {
            title: 'Day',
            value: 'day',
          },
          {
            title: 'Month',
            value: '30-days',
          },
          {
            title: 'Year',
            value: '365-days',
          },
        ]}
      />
    </Setting>
    <Setting
      title="Slow mode"
      subtitle="When enabled, balances are recalculated only once per second. Recommended on low-power devices."
    >
      <Toggle bind:checked={slowModeEnabled} />
    </Setting>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Advanced</h4>
    <Setting
      title="Custom tokens"
      subtitle="Select which non-default tokens you want to use with Drips."
    >
      <Button on:click={() => goto('/app/settings/custom-tokens')} icon={ListIcon}
        >Edit token list</Button
      >
    </Setting>
    <Setting
      title="Reset educational hints"
      subtitle="Resurface all previously-dismissed hints and cards across the app."
    >
      <Button
        disabled={$dismissablesStore.length === 0}
        on:click={() => dismissablesStore.resetDismissables()}
        icon={EyeOpen}>Reset hints</Button
      >
    </Setting>
    {#if network.gaslessClaimAndCollect}
      <Setting
        title="Gasless claim & collect transactions"
        subtitle="When enabled, sends transactions for claiming a project and collecting funds gaslessly using EIP-712. This isn't supported on all networks, and won't work with Safe multisigs."
      >
        <Toggle bind:checked={$gaslessStore} />
      </Setting>
    {/if}
    <Setting
      title="Developer mode"
      subtitle="When enabled, shows developer-focused extra information on address profiles, project profiles and Drip Lists."
    >
      <Toggle bind:checked={$developerModeStore} />
    </Setting>
    <Setting
      title="Build on Drips"
      subtitle="The Drips protocol is fully open-source and ready for you to build on."
    >
      <a class="typo-link" target="_blank" rel="noreferrer" href="https://docs.drips.network"
        >Read the docs</a
      >
    </Setting>
  </div>
  <Divider />
  <div class="section">
    <h4 class="typo-all-caps">Get in touch</h4>
    <Setting
      title="Discuss a funding program"
      subtitle="Reach out to our Partnerships team if you want to use Drips to distribute funding."
    >
      <a class="typo-link" target="_blank" rel="noreferrer" href={INBOUND_LEAD_FORM_URL}
        >Get in touch</a
      >
    </Setting>
    <Setting title="Join the discussion" subtitle="Join our Discord to chat with the team.">
      <a class="typo-link" target="_blank" rel="noreferrer" href="https://discord.gg/BakDKKDpHF"
        >Open Discord Server</a
      >
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
      title="Redaction"
      subtitle="Font by Titus Kaphar, Reginald Dwayne Betts, Forest Young, Jeremy Mickel & contributors under the SIL Open Font License."
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

  .section {
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
  }

  .section h4 {
    margin-bottom: -0.5rem;
  }
</style>
