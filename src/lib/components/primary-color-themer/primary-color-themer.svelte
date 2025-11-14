<script lang="ts">
  import { run } from 'svelte/legacy';

  import themeStore from '$lib/stores/theme/theme.store';
  import hexToRgb from '$lib/utils/hex-to-rgb';
  import possibleColors from '$lib/utils/project/possible-colors';

  // Currently supported project colors plus those that were previously available
  const SUPPORTED_COLORS = [...possibleColors, '#5555FF', '#53DB53', '#FFC555', '#FF5555'];

  interface Props {
    colorHex: string | undefined;
    children?: import('svelte').Snippet;
  }

  let { colorHex, children }: Props = $props();

  let isLightTheme = $derived($themeStore.currentTheme === 'light');

  let colorVars: {
    primary: string;
    'primary-level-1': string;
    'primary-level-2': string;
    'primary-level-6': string;
  } = $state();

  run(() => {
    if (colorHex && SUPPORTED_COLORS.includes(colorHex)) {
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
  });
</script>

<div
  class="project-themer"
  style={colorVars &&
    Object.entries(colorVars)
      .map(([key, v]) => `--color-${key}: ${v};`)
      .join('\n')}
>
  {@render children?.()}
</div>
