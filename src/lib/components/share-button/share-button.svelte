<script lang="ts">
  import { run } from 'svelte/legacy';

  import ShareIcon from '$lib/components/icons/Sharrow.svelte';
  import Button from '../button/button.svelte';
  import { type ComponentProps } from 'svelte';
  import modal from '$lib/stores/modal';
  import { browser } from '$app/environment';

  // The share flow transitively imports the stepper machinery and wallet stack,
  // so it must only ever be imported lazily when the modal actually opens.
  type ShareSteps = typeof import('$lib/flows/share/share-steps').default;

  interface Props {
    text?: string | undefined;
    url: string;
    disabled?: boolean;
    downloadableImageUrl?: string;
    shareModalText?: string | undefined;
    buttonVariant?: ComponentProps<typeof Button>['variant'];
    supportButtonOptions?: Parameters<ShareSteps>[0]['supportButtonOptions'] | undefined;
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

  async function handleClick() {
    const [{ default: Stepper }, { default: shareSteps }] = await Promise.all([
      import('$lib/components/stepper/stepper.svelte'),
      import('$lib/flows/share/share-steps'),
    ]);

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
