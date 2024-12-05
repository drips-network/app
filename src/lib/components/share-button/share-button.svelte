<script lang="ts">
  import ShareIcon from '$lib/components/icons/Sharrow.svelte';
  import Button from '../button/button.svelte';
  import { onMount, type ComponentProps } from 'svelte';
  import modal from '$lib/stores/modal';
  import shareSteps from '$lib/flows/share/share-steps';
  import Stepper from '$lib/components/stepper/stepper.svelte';

  export let text: string | undefined = undefined;
  export let url: string;
  export let disabled = false;
  export let downloadableImageUrl: string = '';
  export let shareModalText: string | undefined = undefined;
  export let buttonVariant: ComponentProps<Button>['variant'] = 'ghost';
  export let supportButtonOptions:
    | Parameters<typeof shareSteps>[0]['supportButtonOptions']
    | undefined = undefined;

  export let shareLabel = 'Share';

  async function preloadImage(url: string) {
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
    } catch (error) {
      // we don't really care to make a big fuss about this
      // eslint-disable-next-line no-console
      console.error('Error preloading image', error);
    }
  }

  function handleClick() {
    modal.show(
      Stepper,
      undefined,
      shareSteps({
        text,
        url,
        downloadableImageUrl,
        shareModalText,
        supportButtonOptions,
      }),
    );
  }

  onMount(() => {
    if (downloadableImageUrl) {
      preloadImage(downloadableImageUrl);
    }
  });
</script>

<Button {disabled} variant={buttonVariant} on:click={handleClick}>
  <div class="button-inner">
    <ShareIcon style="fill:currentColor" />
    {shareLabel}
  </div>
</Button>

<style>
  .button-inner {
    display: flex;
    align-items: center;
    gap: 0.125rem;
    margin-left: -0.25rem;
  }
</style>
