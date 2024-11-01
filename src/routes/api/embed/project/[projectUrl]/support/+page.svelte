<script lang="ts">
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;
</script>

<div>
  <ProjectSupportButton data={data.supportButtonData} options={data.supportButtonOptions} />
</div>
