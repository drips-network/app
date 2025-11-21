<script lang="ts">
  import { run } from 'svelte/legacy';

  import FileIcon from '$lib/components/icons/File.svelte';
  import CheckIcon from '$lib/components/icons/CheckCircle.svelte';
  import Button from '$lib/components/button/button.svelte';
  import Spinner from '$lib/components/spinner/spinner.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    input: {
      file: File;
    };
  }>();

  let fileInput: HTMLInputElement;

  let draggingOver = $state(false);

  function validateFiletype(file: File) {
    return filetypes.includes(file.type);
  }

  let errorMessages: { [key: string]: string } = {
    'wrong-filetype': 'File type is unsupported',
    'too-large': 'File exceeds 5MB',
    'too-many-files': 'Only drop a single file',
  } as const;

  interface Props {
    instructions?: string;
    filetypes?: string[];
    maxFileSize?: number;
    validateCustom?: (file: File) => Promise<string | false>;
    error?: 'wrong-filetype' | 'too-large' | 'too-many-files' | string | undefined;
    loading?: boolean;
    success?: boolean;
    successSlot?: import('svelte').Snippet;
    loadingSlot?: import('svelte').Snippet;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errorSlot?: import('svelte').Snippet<[any]>;
  }

  let {
    instructions = 'Drop a file here to upload',
    filetypes = ['text/plain'],
    maxFileSize = 1024 * 1024 * 5,
    validateCustom = () => Promise.resolve(false),
    error = $bindable(),
    loading = $bindable(false),
    success = $bindable(false),
    successSlot,
    loadingSlot,
    errorSlot,
  }: Props = $props();

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (loading) return;

    error = undefined;
    draggingOver = false;

    const { dataTransfer } = e;
    if (!dataTransfer) return;

    const { files } = dataTransfer;

    if (files.length === 0) return;

    if (files.length > 1) {
      error = 'too-many-files';
      return;
    }

    const file = files[0];

    processFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (loading) return;

    draggingOver = true;
  }

  function handleDragLeave() {
    draggingOver = false;
  }

  function handleSelectFileButtonClick() {
    if (loading) return;

    fileInput.click();
  }

  function handleFileSelected(e: Event & { currentTarget: HTMLInputElement }) {
    if (loading) return;

    error = undefined;

    const file = e.currentTarget.files?.[0];
    if (!file) return;

    processFile(file);
  }

  async function processFile(file: File) {
    if (!validateFiletype(file)) {
      error = 'wrong-filetype';
      return;
    }

    if (file.size > maxFileSize) {
      error = 'too-large';
      return;
    }

    const validationResult = await validateCustom(file);
    if (validationResult) {
      error = validationResult;
      return;
    }

    dispatch('input', { file });
  }
  run(() => {
    if (error) {
      loading = false;
    }
  });
  run(() => {
    if (success) {
      setTimeout(() => {
        success = false;
      }, 2000);
    }
  });
</script>

<input
  bind:this={fileInput}
  onchange={handleFileSelected}
  class="file-input"
  type="file"
  accept={filetypes.join(',')}
/>

<div
  role="region"
  aria-label={instructions}
  class="drop-zone"
  class:dragging-over={draggingOver}
  class:loading
  class:error
  class:success
  ondrop={handleDrop}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
>
  {#if draggingOver}
    <FileIcon style="height: 2rem; width: 2rem; fill: var(--color-primary-level-6)" />
    <p class="typo-text">Drop file to upload</p>
  {:else if success}
    {#if successSlot}{@render successSlot()}{:else}
      <CheckIcon style="height: 2rem; width: 2rem; fill: var(--color-positive-level-6)" />
      <p class="typo-text">Operation successful</p>
    {/if}
  {:else if loading}
    {#if loadingSlot}{@render loadingSlot()}{:else}
      <Spinner />
      <p class="typo-text">Loading…</p>
    {/if}
  {:else}
    <FileIcon
      style={`
      height: 2rem;
      width: 2rem;
      fill: ${error ? 'var(--color-negative-level-6)' : 'var(--color-foreground-level-6)'}
    `}
    />
    <div>
      {#if error}
        {@const defaultContent = `<p class="typo-text-bold">${errorMessages[error]}</p>`}
        {#if errorSlot}{@render errorSlot({ error, defaultContent })}{:else}
          {@html defaultContent}
        {/if}
      {/if}
      <p class="typo-text">{instructions}, or…</p>
    </div>
    <Button variant={error ? 'destructive-outline' : 'normal'} onclick={handleSelectFileButtonClick}
      >Select file</Button
    >
  {/if}
</div>

<style>
  .file-input {
    visibility: hidden;
    position: absolute;
  }

  .drop-zone {
    height: 258px;
    padding-top: 21px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: var(--color-foreground-level-6);
    gap: 1rem;
    border-radius: 1rem 0 1rem 1rem;
    border: 1px solid var(--color-foreground-level-3);
  }

  .drop-zone.loading,
  .drop-zone.dragging-over {
    border-color: var(--color-primary);
    background-color: var(--color-primary-level-1);
    color: var(--color-primary-level-6);
  }

  .drop-zone:not(.dragging-over).error {
    border-color: var(--color-negative);
    background-color: var(--color-negative-level-1);
    color: var(--color-negative-level-6);
  }

  .drop-zone:not(.dragging-over).success {
    border-color: var(--color-positive);
    background-color: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
  }
</style>
