<script lang="ts">
  import type { AuditLog } from '$lib/utils/rpgf/types/auditLog';

  export let log: AuditLog;

  $: payload = log.payload;
</script>

<div class="log-detail-modal">
  {#each Object.entries(payload) as [key, value]}
    {#if Boolean(value)}
      <div class="field">
        <div class="key">{key}</div>
        <div class="value">{JSON.stringify(value)}</div>
      </div>
    {/if}
  {/each}
</div>

<style>
  .log-detail-modal {
    display: flex;
    flex-direction: column;
    text-align: left;
    padding: 1rem;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background-secondary);
  }

  .key {
    font-weight: bold;
    color: var(--color-foreground-secondary);
  }

  .value {
    font-family: monospace;
    white-space: pre-wrap;
    word-break: break-word;
    color: var(--color-foreground);
  }
</style>
