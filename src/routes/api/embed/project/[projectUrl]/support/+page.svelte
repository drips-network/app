<script lang="ts">
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;
</script>

<!-- class typo-text required for correct font when rendering png via puppeteer headless chrome -->
<div class="typo-text">
  <ProjectSupportButton data={data.supportButtonData} options={data.supportButtonOptions} />
</div>
