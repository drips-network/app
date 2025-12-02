<script lang="ts">
  import { run } from 'svelte/legacy';

  import ShareIcon from '$lib/components/icons/Sharrow.svelte';
  import Button from '../button/button.svelte';
  import { type ComponentProps } from 'svelte';
  import modal from '$lib/stores/modal';
  import shareSteps from '$lib/flows/share/share-steps';
  import Stepper from '$lib/components/stepper/stepper.svelte';
  import { browser } from '$app/environment';

  interface Props {
    text?: string | undefined;
    url: string;
    disabled?: boolean;
    downloadableImageUrl?: string;
    shareModalText?: string | undefined;
    buttonVariant?: ComponentProps<typeof Button>['variant'];
    supportButtonOptions?: Parameters<typeof shareSteps>[0]['supportButtonOptions'] | undefined;
    shareLabel?: string;
  }

  let {
    text = undefined,
    url,
    disabled = false,
    downloadableImageUrl = '',
    shareModalText = undefined,
    buttonVariant = 'ghost',
    supportButtonOptions = undefined,
    shareLabel = 'Share',
  }: Props = $props();

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

  run(() => {
    browser && downloadableImageUrl && preloadImage(downloadableImageUrl);
  });

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
</script>

<Button {disabled} variant={buttonVariant} onclick={handleClick}>
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
