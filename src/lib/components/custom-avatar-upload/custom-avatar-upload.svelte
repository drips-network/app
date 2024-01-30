<script lang="ts">
  import FileIcon from 'radicle-design-system/icons/File.svelte';
  import CheckIcon from 'radicle-design-system/icons/CheckCircle.svelte';
  import Button from '../button/button.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{
    uploaded: {
      ipfsCid: string;
    };
  }>();

  let fileInput: HTMLInputElement;

  export let filetypes = ['image/png', 'image/jpeg'];
  export let maxFileSize = 1024 * 1024 * 5; // 5MB

  let draggingOver = false;

  function validateFiletype(file: File) {
    return filetypes.includes(file.type);
  }

  let error: 'wrong-filetype' | 'too-large' | 'too-many-files' | 'upload-failed' | undefined;
  $: {
    if (error) {
      setTimeout(() => {
        error = undefined;
      }, 2000);
    }
  }

  let uploading = false;

  let uploadSuccess = false;
  $: {
    if (uploadSuccess) {
      setTimeout(() => {
        uploadSuccess = false;
      }, 2000);
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    if (uploading) return;

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

    uploadFile(file);
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    if (uploading) return;

    draggingOver = true;
  }

  function handleDragLeave() {
    draggingOver = false;
  }

  function handleSelectFileButtonClick() {
    if (uploading) return;

    fileInput.click();
  }

  function handleFileSelected(e: Event & { currentTarget: HTMLInputElement }) {
    if (uploading) return;

    error = undefined;

    const file = e.currentTarget.files?.[0];
    if (!file) return;

    uploadFile(file);
  }

  async function uploadFile(file: File) {
    if (!validateFiletype(file)) {
      error = 'wrong-filetype';
      return;
    }

    if (file.size > maxFileSize) {
      error = 'too-large';
      return;
    }

    uploading = true;

    const response = await fetch('/api/custom-avatars/upload', {
      method: 'POST',
      body: await file.arrayBuffer(),
      headers: {
        'Content-Type': file.type,
      },
    });

    uploading = false;

    if (response.ok) {
      uploadSuccess = true;

      const json = await response.json();

      dispatch('uploaded', {
        ipfsCid: json.IpfsHash,
      });
    } else {
      error = 'upload-failed';
    }
  }
</script>

<input
  bind:this={fileInput}
  on:change={handleFileSelected}
  class="file-input"
  type="file"
  accept="image/png, image/jpeg"
/>

<div
  class="drop-zone"
  class:dragging-over={draggingOver}
  class:error
  class:upload-success={uploadSuccess}
  on:drop={handleDrop}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
>
  {#if draggingOver}
    <FileIcon style="height: 2rem; width: 2rem; fill: var(--color-primary-level-6)" />
    <p class="typo-text-small">Drop file to upload</p>
  {:else if error}
    <p class="typo-text-small">
      {#if error === 'wrong-filetype'}
        File must be a JPG or PNG
      {:else if error === 'too-large'}
        File exceeds 5MB
      {:else if error === 'upload-failed'}
        Upload failed. Pleae try again later.
      {:else if error === 'too-many-files'}
        Only drop a single file
      {/if}
    </p>
  {:else if uploadSuccess}
    <CheckIcon style="height: 2rem; width: 2rem; fill: var(--color-positive-level-6)" />
    <p class="typo-text-small">Upload successful</p>
  {:else if uploading}
    <Spinner />
    <p class="typo-text-small">Uploading…</p>
  {:else}
    <FileIcon style="height: 2rem; width: 2rem; fill: var(--color-foreground-level-6)}" />
    <p class="typo-text-small">Drop a JPG or PNG here to upload, or…</p>
    <Button on:click={handleSelectFileButtonClick}>Select file</Button>
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
  }

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

  .drop-zone:not(.dragging-over).upload-success {
    border-color: var(--color-positive);
    background-color: var(--color-positive-level-1);
    color: var(--color-positive-level-6);
  }
</style>
