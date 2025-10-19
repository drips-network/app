<script lang="ts">
  import Lock from '$lib/components/icons/Lock.svelte';
  import Tooltip from '$lib/components/tooltip/tooltip.svelte';

  export let title: string;
  export let isPrivate: boolean = false;
</script>

<div class="field">
  <h2 class="typo-header-4" style:display="flex" style:gap="0.2rem">
    {title}

    {#if isPrivate}
      <div style:cursor="help" style:width="fit-content">
        <Tooltip>
          <svelte:fragment slot="tooltip-content">
            This field is private and only visible to admins or the applicant.
          </svelte:fragment>
          <Lock />
        </Tooltip>
      </div>
    {/if}
  </h2>

  <span class="typo-text content">
    <slot />
  </span>
</div>

<div class="divider" />

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    width: fit-content;
    min-width: 0;
    max-width: 100%;
  }

  .divider {
    height: 1px;
    width: calc(100% + 2rem);
    margin: 0 -1rem;
    background-color: var(--color-foreground-level-2);
  }

  .content {
    color: var(--color-foreground-level-6);
  }

  .divider:last-child {
    display: none;
  }
</style>
