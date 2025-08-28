<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import { type ComponentProps } from 'svelte';
  import RpgfSettingsForm, { intitialSettingsState } from './rpgf-settings-form.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { z } from 'zod';
  import { checkSlugAvailability } from '$lib/utils/rpgf/rpgf';
  import network from '$lib/stores/wallet/network';
  import EmojiPicker from '$lib/components/emoji-picker/emoji-picker.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import ColorPicker from '$lib/components/color-picker/color-picker.svelte';
  import TabbedBox from '$lib/components/tabbed-box/tabbed-box.svelte';
  import CustomAvatarUpload from '$lib/components/custom-avatar-upload/custom-avatar-upload.svelte';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;
  $: isDraft = settingsFormProps.wrappedDraftOrRound.type === 'round-draft';

  let updatedRoundOrDraft = intitialSettingsState(settingsFormProps.wrappedDraftOrRound);

  let urlSlugInputValue = updatedRoundOrDraft.urlSlug || '';

  let urlSlugValidationState: TextInputValidationState = { type: 'valid' };

  $: {
    if (!urlSlugInputValue) {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        urlSlug: urlSlugInputValue,
      };
    }
  }

  $: {
    urlSlugInputValue;

    if (urlSlugInputValue === updatedRoundOrDraft.urlSlug) {
      urlSlugValidationState = { type: 'valid' };
    } else {
      urlSlugValidationState = { type: 'unvalidated' };
    }

    showUrlSuccess = false;
  }

  async function validateSlug() {
    if (urlSlugInputValue === updatedRoundOrDraft.urlSlug) {
      urlSlugValidationState = { type: 'valid' };
      return;
    }

    urlSlugValidationState = { type: 'pending' };

    const slugParse = z
      .string()
      .max(255)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL slug must be URL-safe')
      .transform((val) => val.toLowerCase())
      .safeParse(urlSlugInputValue);

    if (slugParse.success) {
      urlSlugInputValue = slugParse.data;

      const isAvailable = await checkSlugAvailability(undefined, slugParse.data);

      if (isAvailable) {
        showUrlSuccess = true;

        updatedRoundOrDraft = {
          ...updatedRoundOrDraft,
          urlSlug: slugParse.data,
        };

        urlSlugValidationState = { type: 'valid' };
      } else {
        urlSlugValidationState = {
          type: 'invalid',
          message: 'URL slug already taken. Please choose another one.',
        };
      }
    } else {
      urlSlugValidationState = {
        type: 'invalid',
        message:
          'Invalid URL slug. Must be a URL-safe string with only lowercase letters, numbers, and hyphens.',
      };
    }
  }

  $: invalid = Boolean(
    urlSlugValidationState.type === 'invalid' || urlSlugValidationState.type === 'unvalidated',
  );

  let showUrlSuccess = false;

  let activeAvatarTab: 'tab-1' | 'tab-2' = updatedRoundOrDraft.customAvatarCid ? 'tab-2' : 'tab-1';

  $: {
    if (activeAvatarTab === 'tab-1') {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        customAvatarCid: null,
      };
    }
  }

  function handleAvatarUploaded(e: CustomEvent<{ ipfsCid: string }>) {
    if (activeAvatarTab !== 'tab-2') {
      return;
    }

    updatedRoundOrDraft = {
      ...updatedRoundOrDraft,
      customAvatarCid: e.detail.ipfsCid,
    };
  }
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft {invalid}>
  <FormField title="Preview">
    <RpgfHeaderCard {isDraft} interactive={false} roundOrDraft={updatedRoundOrDraft} />
  </FormField>

  <FormField title="Round name*">
    <TextInput bind:value={updatedRoundOrDraft.name} placeholder="My RPGF round" />
  </FormField>

  <FormField title="Emoji*">
    <TabbedBox bind:activeTab={activeAvatarTab} ariaLabel="Avatar settings" border={true}>
      <svelte:fragment slot="tab-1">
        <EmojiPicker bind:selectedEmoji={updatedRoundOrDraft.emoji} />
      </svelte:fragment>
      <svelte:fragment slot="tab-2">
        <CustomAvatarUpload on:uploaded={handleAvatarUploaded} />
      </svelte:fragment>
    </TabbedBox>
  </FormField>

  <FormField title="Color*">
    <ColorPicker bind:selectedColor={updatedRoundOrDraft.color} />
  </FormField>

  <FormField title="URL*" disabled={!isDraft || urlSlugValidationState.type === 'pending'}>
    <div class="url-input">
      <span>{network.subdomain}/</span>
      <TextInput
        showSuccessCheck={showUrlSuccess}
        on:blur={validateSlug}
        validationState={urlSlugValidationState}
        bind:value={urlSlugInputValue}
        placeholder="my-rpgf-round"
      />
    </div>
  </FormField>

  <FormField title="Description">
    <TextArea bind:value={updatedRoundOrDraft.description} placeholder="My RPGF round" resizable />
  </FormField>
</RpgfSettingsForm>

<style>
  .url-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
