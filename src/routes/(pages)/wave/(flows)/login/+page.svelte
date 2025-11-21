<script lang="ts">
  import LogInButton from '$lib/components/wave/log-in-button/log-in-button.svelte';

  let { data } = $props();
</script>

<LogInButton backTo={data.backTo || '/wave'} />
