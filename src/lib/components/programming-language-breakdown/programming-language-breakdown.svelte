<script lang="ts">
  import type { UserCodeMetricsDto } from '$lib/utils/wave/types/user';
  import { enrichCodeMetricLanguageBreakdownWithColors } from './language-colors';

  interface Props {
    languageProfile: UserCodeMetricsDto['lifetime_language_profile'];
  }

  let { languageProfile }: Props = $props();

  let enrichedLanguageProfile = $derived.by(() => {
    const enriched = enrichCodeMetricLanguageBreakdownWithColors(languageProfile);

    // merge smaller segments into "Other"
    const THRESHOLD_PCT = 2;
    const majorLangs = enriched.filter((lang) => lang.pct >= THRESHOLD_PCT);
    const otherLangs = enriched.filter((lang) => lang.pct < THRESHOLD_PCT);
    const otherPct = otherLangs.reduce((sum, lang) => sum + lang.pct, 0);

    if (otherPct > 0) {
      majorLangs.push({
        language: 'Other',
        pct: otherPct,
        color: 'var(--color-foreground-level-3)',
      });
    }

    return majorLangs;
  });

  let labels = $derived.by(() => {
    return enrichedLanguageProfile.map((lang) => {
      return {
        language: lang.language,
        color: lang.color,
        pct: lang.pct,
      };
    });
  });

  let hoveringOverLanguage = $state<string | null>(null);
</script>

<div class="programming-language-breakdown">
  <div class="bar">
    {#each enrichedLanguageProfile as lang (lang.language)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="segment"
        class:faded={hoveringOverLanguage && hoveringOverLanguage !== lang.language}
        style="width: {lang.pct}%; background-color: {lang.color};"
        title="{lang.language}: {lang.pct.toFixed(2)}%"
        onmouseenter={() => (hoveringOverLanguage = lang.language)}
        onmouseleave={() => (hoveringOverLanguage = null)}
      ></div>
    {/each}
  </div>

  <div class="labels">
    {#each labels as label (label.language)}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="label"
        style="display: flex; align-items: center; gap: 0.25rem;"
        class:faded={hoveringOverLanguage && hoveringOverLanguage !== label.language}
        onmouseenter={() => (hoveringOverLanguage = label.language)}
        onmouseleave={() => (hoveringOverLanguage = null)}
      >
        <div
          class="color-box"
          style="width: 1rem; height: 1rem; background-color: {label.color}; border: 1px solid var(--color-foreground-level-3);"
        ></div>
        <span class="typo-text-small">{label.language}</span>
        <span class="typo-text-small disabled-text">{label.pct.toFixed(2)}%</span>
      </div>
    {/each}
  </div>
</div>

<style>
  .programming-language-breakdown {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
  }

  .bar {
    display: flex;
    height: 1rem;
    width: 100%;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    overflow: hidden;
    background-color: var(--color-foreground-level-1);
  }

  .segment {
    height: 100%;
    transition: opacity 0.2s;
  }

  .labels {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    transition: opacity 0.2s;
    user-select: none;
  }

  .color-box {
    width: 1rem;
    height: 1rem;
    border-radius: 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }

  .disabled-text {
    color: var(--color-foreground-level-5);
  }

  .faded {
    opacity: 0.5;
  }
</style>
