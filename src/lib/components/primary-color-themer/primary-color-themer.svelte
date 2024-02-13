<script lang="ts">
  import themeStore from '$lib/stores/theme/theme.store';
  import hexToRgb from '$lib/utils/hex-to-rgb';
  import possibleColors from '$lib/utils/project/possible-colors';

  export let colorHex: string | undefined;

  $: isLightTheme = $themeStore.currentTheme === 'light';

  let colorVars: {
    primary: string;
    'primary-level-1': string;
    'primary-level-2': string;
    'primary-level-6': string;
  };

  $: {
    if (colorHex && possibleColors.includes(colorHex)) {
      const rgb = hexToRgb(colorHex);
      const level6Adjustment = isLightTheme ? 30 : -30;

      if (rgb) {
        colorVars = {
          primary: colorHex,
          'primary-level-1': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.17)`,
          'primary-level-2': `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.37)`,
          'primary-level-6': `rgba(${rgb.r - level6Adjustment}, ${rgb.g - level6Adjustment}, ${
            rgb.b - level6Adjustment
          }, 1)`,
        };
      }
    }
  }
</script>

<div
  class="project-themer"
  style={colorVars &&
    Object.entries(colorVars)
      .map(([key, v]) => `--color-${key}: ${v};`)
      .join('\n')}
>
  <slot />
</div>
