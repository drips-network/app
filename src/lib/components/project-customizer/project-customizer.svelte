<script lang="ts">
  import emoji from '$lib/utils/emoji/emoji';
  import type { ClaimedGitProject } from '$lib/utils/metadata/types';
  import possibleColors from '$lib/utils/project/possible-colors';
  import type { Writable } from 'svelte/store';
  import FormField from '../form-field/form-field.svelte';
  import ProjectProfileHeader from '../project-profile-header/project-profile-header.svelte';
  import TextInput from '../text-input/text-input.svelte';

  export let project: Writable<ClaimedGitProject>;

  let selectedEmoji = $project.emoji;
  $: $project.emoji = selectedEmoji;

  let searchTerm = '';
  $: filteredEmoji = emoji.filter((e) => {
    let { alias } = e;

    if (!Array.isArray(alias)) alias = [alias];

    return alias.some((a) => a.toLowerCase().startsWith(searchTerm.toLowerCase()));
  });

  let selectedColor = $project.color;
  $: $project.color = selectedColor;
</script>

<div class="project-customizer">
  <FormField type="div" title="Preview">
    <ProjectProfileHeader project={$project} />
  </FormField>

  <FormField type="div" title="Emoji">
    <TextInput bind:value={searchTerm} placeholder="Search…" />
    <div class="emojis-container">
      <!-- TODO: Make keyboard navigatable -->
      <div class="emojis">
        {#each filteredEmoji as e}
          <div class="emoji" class:selected={selectedEmoji === e.unicode}>
            <input
              id={e.unicode}
              bind:group={selectedEmoji}
              value={e.unicode}
              name="emoji"
              type="radio"
              class="radio"
            />
            <label class="emoji-label" for={e.unicode}>{e.unicode}</label>
          </div>
        {/each}
      </div>
    </div>
  </FormField>

  <FormField type="div" title="Color">
    <div class="colors">
      {#each possibleColors as color}
        <div class="color" class:selected={selectedColor === color}>
          <input type="radio" name="color" bind:group={selectedColor} value={color} id={color} />
          <label class="color-label" style:background-color={color} for={color} />
        </div>
      {/each}
    </div>
  </FormField>
</div>

<style>
  .project-customizer {
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
  }

  .emojis-container {
    box-shadow: var(--elevation-low);
    height: 12rem;
    padding: 0.75rem;
    overflow: scroll;
    margin-top: 1rem;
    border-radius: 1rem 0 1rem 1rem;
  }

  .emojis {
    display: flex;
    flex-wrap: wrap;
    gap: 0.38rem;
  }

  .emoji {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 2rem;
    width: 2rem;
    font-size: 1.5rem;
    border-radius: 0.5rem 0 0.5rem 0.5rem;
    opacity: 0.5;
    transition: all 0.3s;
    cursor: pointer;
    font-family: initial;
  }

  .emoji-label {
    cursor: pointer;
  }

  .emoji:hover {
    opacity: 1;
    background-color: var(--color-foreground-level-1);
    transform: scale(1.1);
  }

  .emoji .radio {
    display: none;
    cursor: pointer;
  }

  .emoji.selected {
    opacity: 1;
    transform: scale(1.1);
    background-color: var(--color-primary-level-2);
  }

  .colors {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .color input {
    display: none;
  }

  .color .color-label {
    display: block;
    height: 4rem;
    width: 4rem;
    opacity: 0.5;
    transition: all 0.3s;
    border-radius: 1rem 0 1rem 1rem;
    cursor: pointer;
  }

  .color.selected .color-label {
    opacity: 1;
    box-shadow: var(--elevation-low);
  }
</style>
