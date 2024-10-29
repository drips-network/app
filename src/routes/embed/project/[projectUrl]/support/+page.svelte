<script lang="ts">
  import { onMount } from 'svelte';
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;

  let backgroundPrepared = false;
  let buttonLoaded = false;

  function onLoad() {
    buttonLoaded = true;
  }

  onMount(async () => {
    // Ensure the background is transparent, so that puppeteer can capture
    // a screenshot with a transparent background (with the additional omitBackground)
    // configuration.
    // There is a transition on the background that is removed by puppeteer when
    // this page is rendered.
    document.documentElement.style.background = 'transparent';
    document.body.style.background = 'transparent';
    const main = document.querySelector('.main') as HTMLElement;
    if (main) {
      main.style.background = 'transparent';
    }

    backgroundPrepared = true;
  });
</script>

<div style:visibility={backgroundPrepared && buttonLoaded ? 'visible' : 'hidden'}>
  <ProjectSupportButton
    on:load={onLoad}
    data={data.supportButtonData}
    options={data.supportButtonOptions}
  />
</div>
