<script lang="ts">
  import VerifiedIcon from '$lib/components/icons/Registered.svelte';
</script>

<div class="typo-text-small-bold">
  <VerifiedIcon style="fill: var(--color-positive-level-6)" />Linked to project
</div>

<style>
  div {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.25rem;
    color: var(--color-positive-level-6);
  }
</style>
