<script lang="ts">
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;

  let backgroundPrepared = true;
  // TODO: remove
  let buttonLoaded = true;

  function onLoad() {
    buttonLoaded = true;
  }
</script>

<div style:visibility={backgroundPrepared && buttonLoaded ? 'visible' : 'hidden'}>
  <ProjectSupportButton
    on:load={onLoad}
    data={data.supportButtonData}
    options={data.supportButtonOptions}
  />
</div>
