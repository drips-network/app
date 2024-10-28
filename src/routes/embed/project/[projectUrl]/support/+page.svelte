<script lang="ts">
  import { onMount } from 'svelte';
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';
  // import wait from '$lib/utils/wait';

  export let data;

  let ready = false;

  // TODO: these elements all have transitions on their backgrounds
  // so we need to wait until that transition to transparent takes place
  // before taking a screenshot.
  onMount(async () => {
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    const main = document.querySelector('.main') as HTMLElement;
    if (main) {
      main.style.background = 'transparent';
    }

    // await wait(200);
    ready = true;
  });
</script>

{#if ready}
  <ProjectSupportButton data={data.supportButtonData} options={data.supportButtonOptions} />
{/if}
