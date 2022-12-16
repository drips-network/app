<script lang="ts">
  export let selected: boolean;
</script>

<div class="selected-dot">
  <div class="inner" class:selected />
  <div class="outer" class:selected />
</div>

<style>
  .selected-dot {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 1.5rem;
    width: 1.5rem;
    position: relative;
  }

  .inner {
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground-level-4);
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 1.25rem;
    transition: width 0.3s, height 0.3s, background-color 0.3s, box-shadow 0.3s;
  }

  .inner.selected {
    width: 0.875rem;
    height: 0.875rem;
    background-color: var(--color-primary);
    box-shadow: none;
  }

  .outer {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 2rem;
    height: 2rem;
    border-radius: 1.5rem;
    box-shadow: red;
    transition: width 0.3s, height 0.3s, box-shadow 0.3s;
  }

  .outer.selected {
    width: 1.5rem;
    height: 1.5rem;
    box-shadow: inset 0px 0px 0px 1px var(--color-foreground);
  }
</style>
