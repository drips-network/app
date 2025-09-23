<script lang="ts">
  import CheckCircle from '$lib/components/icons/CheckCircle.svelte';

  export let title: string;
  export let date: Date;
  export let isActive: boolean;
  export let isDone: boolean;
  export let until: Date | undefined;

  export let elem: HTMLTimeElement;
</script>

<time
  class:active={isActive}
  class:done={isDone}
  bind:this={elem}
  class="schedule-item"
  datetime={date.toISOString()}
>
  <div class="title">
    {#if isDone}
      <CheckCircle style="height: 1rem; width: 1rem" />
    {/if}
    <h5>{title}</h5>
  </div>
  <p style:color="var(--color-foreground-level-5)">
    {!until ? 'Starting ' : ''}
    {date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
    {until ? ` - ${until.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}` : ''}
  </p>
</time>

<style>
  time {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  h5 {
    color: var(--color-foreground-level-5);
  }

  .title {
    display: flex;
    gap: 0.25rem;
    align-items: center;
  }

  .active {
    opacity: 1;
  }

  .active h5 {
    color: var(--color-primary-level-6);
  }
</style>
