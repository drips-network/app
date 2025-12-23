<script lang="ts">
  import DripList from '$lib/components/icons/DripList.svelte';
  import getContrastColor from '$lib/utils/get-contrast-text-color';
  import type { Component } from 'svelte';
  import backgroundImage from './background-image';

  const { data } = $props();
  const { bgColor, type, headline, avatarSrc, stats, streamIcons, streamAmount } = $derived(data);

  const ICON_MAP: Record<string, Component<{ style?: string }>> = {
    DripList: DripList,
  };

  const contrastColor = $derived(getContrastColor(bgColor));
  const renderedBgImage = $derived(backgroundImage(bgColor, contrastColor));
</script>

<div
  id="content"
  style:background-color={bgColor}
  class="share-image"
  style:height="630px"
  style:width="1200px"
>
  <div class="bg">
    {@html renderedBgImage}
  </div>

  <div class="content" style:color={contrastColor}>
    {#if avatarSrc}
      <!-- svelte-ignore a11y_missing_attribute -->
      <img src={avatarSrc} />
    {/if}

    <div class="type-and-headline">
      <span class="type">{type}</span>
      <span class="headline">{headline}</span>

      {#if (stats?.length ?? 0) > 0}
        <div class="stats">
          {#each stats as stat (stat.label)}
            {@const Icon = ICON_MAP[stat.icon]}
            <div class="stat">
              {#if Icon}
                <Icon style="fill: {contrastColor}; height: 32px; width: 32px;" />
              {/if}
              <span class="label">{stat.label}</span>
            </div>
          {/each}
        </div>
      {/if}

      {#if streamIcons && streamIcons.length > 0}
        <div class="stream-footer">
          <div class="stream-icons">
            {#each streamIcons as icon (icon)}
              <!-- svelte-ignore a11y_missing_attribute -->
              <img src={icon} class="stream-icon" />
            {/each}
          </div>
          {#if streamAmount}
            <span class="stream-amount">{streamAmount}</span>
          {/if}
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  @font-face {
    font-family: 'Redaction 50';
    font-weight: 400;
    font-style: normal;
    src: url('/fonts/redaction/Redaction_35-Italic.woff2') format('woff2');
  }

  @font-face {
    font-family: 'Inter Regular';
    src: url('/fonts/Inter-Regular.woff2');
    font-display: swap;
  }

  #content {
    position: relative;
  }

  .share-image {
    width: 1200px;
    height: 630px;
    background-color: #f0f0f0;
  }

  * {
    font-family: 'Inter Regular';
  }

  .content {
    position: absolute;
    bottom: 40px;
    left: 40px;
    width: 80%;
    height: 200px;
    color: white;
    display: flex;
    align-items: center;
  }

  .content img {
    border: 2px solid black;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 24px;
    flex-shrink: 0;
  }

  .type-and-headline {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .type {
    font-size: 32px;
  }

  .headline {
    font-family: 'Redaction 50';
    font-size: 80px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .stats {
    display: flex;
    gap: 24px;
    align-items: center;
    margin-top: 12px;
    font-size: 24px;
  }

  .stat {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stream-footer {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-top: 24px;
  }

  .stream-icons {
    display: flex;
    gap: 8px;
  }

  .stream-icon {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid black;
    object-fit: cover;
    background-color: white; /* Fallback */
  }

  .stream-amount {
    font-size: 32px;
  }
</style>
