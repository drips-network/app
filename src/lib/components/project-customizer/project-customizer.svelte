<script lang="ts" module>
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
  import { run } from 'svelte/legacy';

  import type { Writable } from 'svelte/store';
  import FormField from '../form-field/form-field.svelte';
  import ProjectProfileHeader from '../project-profile-header/project-profile-header.svelte';
  import { gql } from 'graphql-request';
  import type { ProjectCustomizerFragment } from './__generated__/gql.generated';
  import FileUpload from '../custom-avatar-upload/custom-avatar-upload.svelte';
  import TabbedBox from '../tabbed-box/tabbed-box.svelte';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import Toggle from '$lib/components/toggle/toggle.svelte';
  import EmojiPicker from '../emoji-picker/emoji-picker.svelte';
  import ColorPicker from '../color-picker/color-picker.svelte';


  let activeTab: 'tab-1' | 'tab-2' =
    $state($newProjectData.avatar.__typename === 'EmojiAvatar' ? 'tab-1' : 'tab-2');

  let selectedEmoji =
    $state($newProjectData.avatar.__typename === 'EmojiAvatar' ? $newProjectData.avatar.emoji : '💧');
  function handleEmojiChange(newEmoji: string) {
    $newProjectData.avatar = {
      __typename: 'EmojiAvatar',
      emoji: newEmoji,
    };
  }
  run(() => {
    handleEmojiChange(selectedEmoji);
  });

  let selectedColor = $state($newProjectData.color);
  function handleColorChange(newColor: string) {
    $newProjectData.color = newColor;
  }
  run(() => {
    handleColorChange(selectedColor);
  });

  let isVisible = $state($newProjectData.isProjectVisible);
  function handleIsVisibleChange(isVisible: boolean) {
    $newProjectData.isProjectVisible = isVisible;
  }
  run(() => {
    handleIsVisibleChange(isVisible);
  });

  let lastUploadedCid =
    $state($newProjectData.avatar.__typename === 'ImageAvatar' ? $newProjectData.avatar.cid : undefined);
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
  run(() => {
    handleTabChange(activeTab, lastUploadedCid);
  });

  interface Props {
    originalProject: ProjectCustomizerFragment;
    newProjectData: Writable<
    ReturnType<
      typeof filterCurrentChainData<ProjectCustomizerFragment['chainData'][number], 'claimed'>
    > & { isProjectVisible: boolean }
  >;
    valid?: boolean;
  }

  let { originalProject, newProjectData, valid = $bindable(false) }: Props = $props();
  run(() => {
    valid = Boolean(activeTab === 'tab-1' || lastUploadedCid);
  });
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
    <!-- @migration-task: migrate this slot by hand, `tab-1` is an invalid identifier -->
  <svelte:fragment slot="tab-1">
      <EmojiPicker bind:selectedEmoji />
    </svelte:fragment>
    <!-- @migration-task: migrate this slot by hand, `tab-2` is an invalid identifier -->
  <svelte:fragment slot="tab-2">
      <FileUpload on:uploaded={handleFileUpload} />
    </svelte:fragment>
  </TabbedBox>

  <FormField type="div" title="Color">
    <ColorPicker bind:selectedColor />
  </FormField>

  <FormField type="div" title="Visibility">
    <div class="visibility-toggle">
      <div style="display: flex; gap: 0.5rem; ">
        <p>Show this project on my profile</p>
        <a
          style="text-decoration: underline; display: inline;"
          target="_blank"
          href="https://docs.drips.network/advanced/drip-list-and-project-visibility"
        >
          Learn more
        </a>
      </div>
      <Toggle bind:checked={isVisible} />
    </div>
  </FormField>
</div>

<style>
  .project-customizer {
    display: flex;
    gap: 1.5rem;
    flex-direction: column;
  }

  .visibility-toggle {
    display: flex;
    justify-content: space-between;
  }
</style>
