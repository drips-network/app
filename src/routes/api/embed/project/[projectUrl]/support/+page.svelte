<script lang="ts">
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;
</script>

<div class="typo-text">
  <!-- typo-text required for puppeteer headless chrome -->
  <ProjectSupportButton data={data.supportButtonData} options={data.supportButtonOptions} />
</div>
