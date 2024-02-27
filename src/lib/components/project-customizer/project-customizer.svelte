<script lang="ts" context="module">
  export const PROJECT_CUSTOMIZER_FRAGMENT = gql`
    ${PROJECT_PROFILE_HEADER_FRAGMENT}
    fragment ProjectCustomizer on ClaimedProject {
      ...ProjectProfileHeader
      avatar {
        ... on EmojiAvatar {
          emoji
        }
        ... on ImageAvatar {
          cid
        }
      }
      color
    }
  `;
</script>

<script lang="ts">
  import emoji from '$lib/utils/emoji/emoji';
  import possibleColors from '$lib/utils/project/possible-colors';
  import type { Writable } from 'svelte/store';
  import FormField from '../form-field/form-field.svelte';
  import ProjectProfileHeader, {
    PROJECT_PROFILE_HEADER_FRAGMENT,
  } from '../project-profile-header/project-profile-header.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectCustomizerFragment } from './__generated__/gql.generated';
  import FileUpload from '../custom-avatar-upload/custom-avatar-upload.svelte';
  import TabbedBox from '../tabbed-box/tabbed-box.svelte';
  import twemoji from '$lib/utils/twemoji';

  export let project: Writable<ProjectCustomizerFragment>;

  let selectedEmoji = $project.avatar.__typename === 'EmojiAvatar' ? $project.avatar.emoji : '💧';

  let searchTerm = '';
  $: filteredEmoji = emoji.filter((e) => {
    let { tags, description, aliases } = e;

    return [...tags, ...aliases, description].some((a) =>
      a.toLowerCase().startsWith(searchTerm.toLowerCase()),
    );
  });

  let lastUploadedAvatarCid: string | undefined =
    $project.__typename === 'ClaimedProject' && $project.avatar.__typename === 'ImageAvatar'
      ? $project.avatar.cid
      : undefined;
  $: {
    if (lastUploadedAvatarCid && activeTab === 'tab-2') {
      $project.avatar = {
        __typename: 'ImageAvatar',
        cid: lastUploadedAvatarCid,
      };
    }
  }

  function handleFileUpload(e: CustomEvent<{ ipfsCid: string }>) {
    if (activeTab !== 'tab-2') {
      return;
    }

    lastUploadedAvatarCid = e.detail.ipfsCid;
  }

  let activeTab = $project.avatar.__typename === 'EmojiAvatar' ? 'tab-1' : 'tab-2';

  $: {
    if (activeTab === 'tab-1') {
      $project.avatar = {
        __typename: 'EmojiAvatar',
        emoji: selectedEmoji,
      };
    }
  }

  export let valid = false;
  $: valid = Boolean(activeTab === 'tab-1' || lastUploadedAvatarCid);

  let selectedColor = $project.color;
  $: $project.color = selectedColor;
</script>

<div class="project-customizer">
  <FormField type="div">
    <ProjectProfileHeader
      pendingAvatar={activeTab === 'tab-2' && !lastUploadedAvatarCid}
      project={$project}
    />
  </FormField>

  <TabbedBox bind:activeTab ariaLabel="Avatar settings">
    <svelte:fragment slot="tab-1">
      <input class="emoji-search-input" type="text" bind:value={searchTerm} placeholder="Search…" />
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
              <label class="emoji-label" for={e.unicode}
                >{@html twemoji(e.unicode, {
                  attributes: () => ({ loading: 'lazy' }),
                })}</label
              >
            </div>
          {/each}
        </div>
      </div>
    </svelte:fragment>
    <svelte:fragment slot="tab-2">
      <FileUpload on:uploaded={handleFileUpload} />
    </svelte:fragment>
  </TabbedBox>

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

  .emoji-search-input {
    height: 3rem;
    border-bottom: 1px solid var(--color-foreground);
    padding: 0 1rem 0.5rem 1rem;
    width: 100%;
    margin-top: 18px;
  }

  .emoji-search-input:focus {
    outline: none;
  }

  .emojis-container {
    height: 12rem;
    padding: 0.75rem;
    overflow: scroll;
    border-radius: 1rem 0 1rem 1rem;
  }

  .emojis {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(2rem, 1fr));
    flex-wrap: wrap;
    gap: 0.5rem;
    user-select: none;
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

  .colors {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(4rem, 1fr));
    gap: 0.5rem;
  }

  .color input {
    display: none;
  }

  .color .color-label {
    display: block;
    height: 100%;
    width: 100%;
    height: 4rem;
    transition: all 0.3s;
    border-radius: 1rem 0 1rem 1rem;
    cursor: pointer;
    transform: scale(0.95);
  }

  .color.selected .color-label {
    transform: scale(1);
    box-shadow: var(--elevation-low);
  }
</style>
