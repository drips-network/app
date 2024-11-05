<script lang="ts">
  import ProjectSupportButton from '$lib/components/project-support-button/project-support-button.svelte';

  export let data;
</script>

<ProjectSupportButton data={data.supportButtonData} options={data.supportButtonOptions} />
