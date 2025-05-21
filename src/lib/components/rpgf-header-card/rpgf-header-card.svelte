<script lang="ts">
  import type { CreateRoundDto } from "$lib/utils/rpgf/schemas";
  import EmojiAvatar from "../emoji-avatar/emoji-avatar.svelte";

  export let roundOrDraft: Partial<CreateRoundDto>;
</script>

<div class="rpgf-header-card">
  <EmojiAvatar emoji={roundOrDraft.emoji} color={roundOrDraft.color} size="huge" />
</div>

<style>
  .rpgf-header-card {
    border: 1px solid var(--color-foreground-level-3);
    border-radius: 1rem 0 1rem 1rem;
    padding: 1rem;
  }
</style>
