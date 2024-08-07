<script lang="ts">
  import CheckIcon from '$lib/components/icons/CheckCircle.svelte';
  import Spinner from '../spinner/spinner.svelte';
  import { createEventDispatcher } from 'svelte';
  import DropZone from '../drop-zone/drop-zone.svelte';

  const dispatch = createEventDispatcher<{
    uploaded: {
      ipfsCid: string;
    };
  }>();

  let filetypes = ['image/png', 'image/jpeg'];
  let error: 'upload-failed' | undefined;
  let uploading = false;
  let uploadSuccess = false;

  $: {
    if (uploadSuccess) {
      setTimeout(() => {
        uploadSuccess = false;
      }, 2000);
    }
  }

  async function uploadFile(file: File) {
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

  function handleDropZoneInput({ file }: { file: File }) {
    uploadFile(file);
  }
</script>

<DropZone
  {filetypes}
  instructions="Drop a JPG or PNG file here to upload"
  loading={uploading}
  success={uploadSuccess}
  {error}
  on:input={(event) => handleDropZoneInput({ file: event.detail.file })}
>
  <svelte:fragment slot="loading">
    <Spinner />
    <p class="typo-text">Uploading…</p>
  </svelte:fragment>
  <svelte:fragment slot="error" let:error let:defaultContent>
    {#if error === 'wrong-filetype'}
      <p class="typo-text-bold">File must be a JPG or PNG</p>
    {:else if error == 'upload-failed'}
      <p class="typo-text-bold">Upload failed. Please try again later.</p>
    {:else}
      {@html defaultContent}
    {/if}
  </svelte:fragment>
  <svelte:fragment slot="success">
    <CheckIcon style="height: 2rem; width: 2rem; fill: var(--color-positive-level-6)" />
    <p class="typo-text">Upload successful</p>
  </svelte:fragment>
</DropZone>

<style>
</style>
