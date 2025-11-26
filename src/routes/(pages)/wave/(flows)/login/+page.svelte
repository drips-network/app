<script lang="ts">
  import LogInButton from '$lib/components/wave/log-in-button/log-in-button.svelte';

  let { data } = $props();
</script>

<h1>Sign in to Drips Wave</h1>
<p>To start using Drips Wave, please sign in with your GitHub account.</p>

<LogInButton primary wordy backTo={data.backTo || '/wave'} />
