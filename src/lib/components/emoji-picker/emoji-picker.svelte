<script lang="ts">
  import emoji from '$lib/utils/emoji/emoji';
  import twemoji from '$lib/utils/twemoji';
  import VirtualList from 'svelte-tiny-virtual-list';

  export let selectedEmoji: string | undefined;

  export let category = 'Smileys & Emotion';

  const categories = [
    'Smileys & Emotion',
    'People & Body',
    'Animals & Nature',
    'Food & Drink',
    'Travel & Places',
    'Activities',
    'Objects',
    'Symbols',
    'Flags',
  ] as const;

  const categoryEmoji: Record<(typeof categories)[number], string> = {
    'Smileys & Emotion': '😀',
    'People & Body': '🧍',
    'Animals & Nature': '🐶',
    'Food & Drink': '🍔',
    'Travel & Places': '🌍',
    Activities: '⚽️',
    Objects: '📦',
    Symbols: '✅',
    Flags: '🏳️‍🌈',
  };

  let searchTerm = '';

  // Approximate number of emojis per row based on the grid layout
  const EMOJIS_PER_ROW = 15;
  const ROW_HEIGHT = 40; // Height of each row (2rem emoji + 0.5rem padding-bottom)
  const CONTAINER_HEIGHT = 240; // 15rem in px
  const CONTAINER_PADDING = 12; // 0.75rem padding in px
  const CATEGORIES_HEIGHT = 48; // Approximate height of categories section (buttons + margin)

  let categoriesElement: HTMLDivElement | undefined;
  let actualCategoriesHeight = CATEGORIES_HEIGHT;

  $: filteredEmoji = emoji.filter((e) => {
    let { tags, description, aliases, unicode } = e;

    return searchTerm
      ? [...tags, ...aliases, description, unicode].some((a) =>
          a.toLowerCase().includes(searchTerm.toLowerCase()),
        )
      : e.category === category;
  });

  // Group emojis into rows for virtual scrolling
  $: emojiRows = Array.from({ length: Math.ceil(filteredEmoji.length / EMOJIS_PER_ROW) }, (_, i) =>
    filteredEmoji.slice(i * EMOJIS_PER_ROW, (i + 1) * EMOJIS_PER_ROW),
  );

  // Calculate virtual list height accounting for categories section and padding
  $: virtualListHeight = searchTerm
    ? CONTAINER_HEIGHT - CONTAINER_PADDING * 2
    : CONTAINER_HEIGHT - actualCategoriesHeight - CONTAINER_PADDING * 2;

  // Update actual categories height when element is available
  $: if (categoriesElement) {
    actualCategoriesHeight = categoriesElement.offsetHeight;
  }
</script>

<div class="emoji-picker">
  <input class="emoji-search-input" type="text" bind:value={searchTerm} placeholder="Search…" />
  <div class="emojis-container">
    {#if !searchTerm}
      <div class="categories" bind:this={categoriesElement}>
        {#each categories as c}
          <button
            class="category typo-text-small"
            class:selected={category === c}
            on:click={() => (category = c)}
          >
            {categoryEmoji[c]}
          </button>
        {/each}
      </div>
    {/if}

    {#if emojiRows.length > 0}
      <VirtualList
        height={virtualListHeight}
        width="100%"
        itemCount={emojiRows.length}
        itemSize={ROW_HEIGHT}
      >
        <div slot="item" let:index let:style {style}>
          <div class="emojis-row">
            {#each emojiRows[index] as e}
              <div class="emoji" class:selected={selectedEmoji === e.unicode}>
                <input
                  id={e.unicode}
                  bind:group={selectedEmoji}
                  value={e.unicode}
                  name="emoji"
                  type="radio"
                  class="radio"
                />
                <label class="emoji-label" for={e.unicode}
                  >{@html twemoji(e.unicode, {
                    attributes: () => ({ loading: 'lazy' }),
                  })}</label
                >
              </div>
            {/each}
          </div>
        </div>
      </VirtualList>
    {/if}
  </div>
</div>

<style>
  .emoji-picker {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .emoji-search-input {
    height: 3rem;
    border-bottom: 1px solid var(--color-foreground-level-3);
    padding: 0 1rem 0.5rem 1rem;
    width: 100%;
    margin-top: 0.5rem;
  }

  .emoji-search-input:focus {
    outline: none;
  }

  .emojis-container {
    position: relative;
    height: 15rem;
    padding: 0.75rem;
    overflow: hidden;
    border-radius: 1rem 0 1rem 1rem;
  }

  .categories {
    display: flex;
    gap: 0.1rem;
    width: 100%;
    margin: 0 auto;
    margin-bottom: 1rem;
    overflow-x: auto;
    border-radius: 1rem;
    background-color: var(--color-foreground-level-1);
    white-space: nowrap;
  }

  .categories > .category {
    flex-grow: 1;
    padding: 0.5rem 0.125rem;
    display: flex;
    border-radius: 1rem;
    justify-content: center;
    align-items: center;
  }

  .categories > .category:hover {
    background-color: var(--color-foreground-level-2);
  }

  .categories > .category.selected {
    background-color: var(--color-primary-level-2);
  }

  .categories button {
    font-size: 1rem;
  }

  .emojis-row {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    gap: 0.5rem;
    user-select: none;
    padding-bottom: 0.5rem;
  }

  .emoji {
    background-color: var(--color-foreground-level-1);
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2rem;
    width: 8%;
    min-width: 2rem;
    font-size: 1.5rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    transition: all 0.3s;
    cursor: pointer;
    font-family: initial;
  }

  .emoji-label {
    cursor: pointer;
    height: 24px;
    width: 24px;
  }

  .emoji:hover {
    background-color: var(--color-foreground-level-1);
    transform: scale(1.1);
  }

  .emoji .radio {
    display: none;
    cursor: pointer;
  }

  .emoji.selected {
    transform: scale(1.1);
    background-color: var(--color-primary-level-2);
  }
</style>
