<script lang="ts">
  import { PUBLIC_TURNSTILE_SITE_KEY } from '$env/static/public';
  import { onMount } from 'svelte';

  let { ontoken }: { ontoken: (token: string | undefined) => void } = $props();

  let container: HTMLDivElement;
  let widgetId: string | undefined;

  onMount(() => {
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let mounted = true;

    function renderWidget() {
      if (!mounted || !container) return;

      if (typeof window.turnstile === 'undefined') {
        // Turnstile script hasn't loaded yet, poll for it
        pollInterval = setInterval(() => {
          if (typeof window.turnstile !== 'undefined') {
            clearInterval(pollInterval);
            pollInterval = undefined;
            renderWidget();
          }
        }, 100);
        return;
      }

      widgetId = window.turnstile.render(container, {
        sitekey: PUBLIC_TURNSTILE_SITE_KEY,
        callback: (t: string) => {
          ontoken(t);
        },
        'expired-callback': () => {
          ontoken(undefined);
        },
        'error-callback': () => {
          ontoken(undefined);
        },
      });
    }

    renderWidget();

    return () => {
      mounted = false;

      if (pollInterval) {
        clearInterval(pollInterval);
      }

      if (widgetId !== undefined) {
        window.turnstile.remove(widgetId);
      }
    };
  });
</script>

<div bind:this={container}></div>
