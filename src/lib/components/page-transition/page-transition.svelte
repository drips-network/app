<script>
  import { fly } from 'svelte/transition';
  export let pathname = '';
</script>

{#key pathname}
  <div in:fly={{ y: 10, duration: 500, delay: 250 }} out:fly={{ y: 10, duration: 250 }}>
    <slot />
  </div>
{/key}
