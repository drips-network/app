<script lang="ts" context="module">
  import { PROJECT_PROFILE_HEADER_FRAGMENT } from '../project-profile-header/project-profile-header.svelte';

  export const PROJECT_CUSTOMIZER_FRAGMENT = gql`
    ${PROJECT_PROFILE_HEADER_FRAGMENT}
    fragment ProjectCustomizer on Project {
      ...ProjectProfileHeader
      chainData {
        ... on ClaimedProjectData {
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
      }
      isVisible
    }
  `;
</script>

<script lang="ts">
  import emoji from '$lib/utils/emoji/emoji';
  import possibleColors from '$lib/utils/project/possible-colors';
  import type { Writable } from 'svelte/store';
  import FormField from '../form-field/form-field.svelte';
  import ProjectProfileHeader from '../project-profile-header/project-profile-header.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectCustomizerFragment } from './__generated__/gql.generated';
  import FileUpload from '../custom-avatar-upload/custom-avatar-upload.svelte';
  import TabbedBox from '../tabbed-box/tabbed-box.svelte';
  import twemoji from '$lib/utils/twemoji';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import Toggle from '$lib/components/toggle/toggle.svelte';

  export let originalProject: ProjectCustomizerFragment;
  export let newProjectData: Writable<
    ReturnType<
      typeof filterCurrentChainData<ProjectCustomizerFragment['chainData'][number], 'claimed'>
    > & { isProjectHidden: boolean }
  >;

  let activeTab: 'tab-1' | 'tab-2' =
    $newProjectData.avatar.__typename === 'EmojiAvatar' ? 'tab-1' : 'tab-2';

  let searchTerm = '';
  $: filteredEmoji = emoji.filter((e) => {
    let { tags, description, aliases, unicode } = e;

    return [...tags, ...aliases, description, unicode].some((a) =>
      a.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  });

  let selectedEmoji =
    $newProjectData.avatar.__typename === 'EmojiAvatar' ? $newProjectData.avatar.emoji : '💧';
  function handleEmojiChange(newEmoji: string) {
    $newProjectData.avatar = {
      __typename: 'EmojiAvatar',
      emoji: newEmoji,
    };
  }
  $: handleEmojiChange(selectedEmoji);

  let selectedColor = $newProjectData.color;
  function handleColorChange(newColor: string) {
    $newProjectData.color = newColor;
  }
  $: handleColorChange(selectedColor);

  let isHidden = $newProjectData.isProjectHidden;
  function handleIsHiddenChange(isHidden: boolean) {
    $newProjectData.isProjectHidden = isHidden;
  }
  $: handleIsHiddenChange(isHidden);

  let lastUploadedCid =
    $newProjectData.avatar.__typename === 'ImageAvatar' ? $newProjectData.avatar.cid : undefined;
  function handleFileUpload(e: CustomEvent<{ ipfsCid: string }>) {
    if (activeTab !== 'tab-2') {
      return;
    }

    lastUploadedCid = e.detail.ipfsCid;

    $newProjectData.avatar = {
      __typename: 'ImageAvatar',
      cid: lastUploadedCid,
    };
  }

  function handleTabChange(newTab: 'tab-1' | 'tab-2', lastUploadedCid: string | undefined) {
    if (newTab === 'tab-1') {
      $newProjectData.avatar = {
        __typename: 'EmojiAvatar',
        emoji: selectedEmoji,
      };
    } else if (newTab === 'tab-2' && lastUploadedCid) {
      $newProjectData = {
        ...$newProjectData,
        avatar: {
          __typename: 'ImageAvatar',
          cid: lastUploadedCid,
        },
      };
    } else {
      return;
    }
  }
  $: handleTabChange(activeTab, lastUploadedCid);

  export let valid = false;
  $: valid = Boolean(activeTab === 'tab-1' || lastUploadedCid);
</script>

<div class="project-customizer">
  <FormField type="div">
    <div style:pointer-events="none">
      <ProjectProfileHeader
        pendingAvatar={activeTab === 'tab-2' && !lastUploadedCid}
        project={{
          ...originalProject,
          chainData: [$newProjectData],
        }}
      />
    </div>
  </FormField>

  <TabbedBox bind:activeTab ariaLabel="Avatar settings" border={true}>
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

  <div class="visibility-toggle">
    <h4>Hide this project from my profile</h4>
    <Toggle bind:checked={isHidden} />
  </div>
  <div class="hide-info">
    <p>This will only hide the project from your public profile</p>
    <ul>
      <li><p>· It will remain claimed by you on the blockchain</p></li>
      <li><p>· Any existing funding will continue to flow to and from it</p></li>
      <li><p>· It will be visible from a direct link</p></li>
    </ul>
  </div>
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

  .visibility-toggle {
    display: flex;
    justify-content: space-between;
  }

  .hide-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  .hide-info > p {
    margin-bottom: 1rem;
  }

  .hide-info li {
    display: flex;
    margin-left: 0.5rem;
  }
</style>
