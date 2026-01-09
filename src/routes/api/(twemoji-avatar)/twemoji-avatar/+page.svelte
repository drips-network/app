<script lang="ts">
  let { data } = $props();
  let { emoji, bgColor } = $derived(data);
</script>

<div id="content" class="emoji-avatar" style="background-color: {bgColor};">
  {@html emoji}
</div>

<style>
  .emoji-avatar {
    width: 128px;
    height: 128px;
    padding: 2.5rem;
  }
</style>
