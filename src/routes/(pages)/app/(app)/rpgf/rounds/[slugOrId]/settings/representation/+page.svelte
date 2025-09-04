<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { z } from 'zod';
  import { checkSlugAvailability, updateRound } from '$lib/utils/rpgf/rpgf';
  import network from '$lib/stores/wallet/network';
  import EmojiPicker from '$lib/components/emoji-picker/emoji-picker.svelte';
  import RpgfHeaderCard from '$lib/components/rpgf-header-card/rpgf-header-card.svelte';
  import ColorPicker from '$lib/components/color-picker/color-picker.svelte';
  import TabbedBox from '$lib/components/tabbed-box/tabbed-box.svelte';
  import CustomAvatarUpload from '$lib/components/custom-avatar-upload/custom-avatar-upload.svelte';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';

  export let data;
  $: isDraft = !data.round.published;

  let updatedRound = { ...data.round };

  let urlSlugInputValue = updatedRound.urlSlug || '';

  let urlSlugValidationState: TextInputValidationState = { type: 'valid' };

  $: {
    if (!urlSlugInputValue) {
      updatedRound = {
        ...updatedRound,
        urlSlug: urlSlugInputValue,
      };
    }
  }

  $: {
    urlSlugInputValue;

    if (urlSlugInputValue === updatedRound.urlSlug) {
      urlSlugValidationState = { type: 'valid' };
    } else {
      urlSlugValidationState = { type: 'unvalidated' };
    }

    showUrlSuccess = false;
  }

  async function validateSlug() {
    if (urlSlugInputValue === updatedRound.urlSlug) {
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

        updatedRound = {
          ...updatedRound,
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

  let activeAvatarTab: 'tab-1' | 'tab-2' = updatedRound.customAvatarCid ? 'tab-2' : 'tab-1';

  $: {
    if (activeAvatarTab === 'tab-1') {
      updatedRound = {
        ...updatedRound,
        customAvatarCid: null,
      };
    }
  }

  function handleAvatarUploaded(e: CustomEvent<{ ipfsCid: string }>) {
    if (activeAvatarTab !== 'tab-2') {
      return;
    }

    updatedRound = {
      ...updatedRound,
      customAvatarCid: e.detail.ipfsCid,
    };
  }

  $: changesMade = 
    updatedRound.name !== data.round.name ||
    updatedRound.emoji !== data.round.emoji ||
    updatedRound.color !== data.round.color ||
    updatedRound.urlSlug !== data.round.urlSlug ||
    updatedRound.description !== data.round.description ||
    updatedRound.customAvatarCid !== data.round.customAvatarCid;

  async function saveHandler() {
    await updateRound(undefined,
      data.round.id,
      {
        name: updatedRound.name,
        emoji: updatedRound.emoji,
        color: updatedRound.color,
        urlSlug: updatedRound.urlSlug,
        description: updatedRound.description,
        customAvatarCid: updatedRound.customAvatarCid,
      }
    )
  }
</script>

<RpgfSettingsForm round={data.round} {invalid} saveEnabled={changesMade} {saveHandler}>
  <FormField title="Preview">
    <RpgfHeaderCard round={updatedRound} interactive={false} />
  </FormField>

  <FormField title="Round name*">
    <TextInput bind:value={updatedRound.name} placeholder="My RPGF round" />
  </FormField>

  <FormField title="Avatar*">
    <TabbedBox bind:activeTab={activeAvatarTab} ariaLabel="Avatar settings" border={true}>
      <svelte:fragment slot="tab-1">
        <EmojiPicker bind:selectedEmoji={updatedRound.emoji} />
      </svelte:fragment>
      <svelte:fragment slot="tab-2">
        <CustomAvatarUpload on:uploaded={handleAvatarUploaded} />
      </svelte:fragment>
    </TabbedBox>
  </FormField>

  <FormField title="Color*">
    <ColorPicker bind:selectedColor={updatedRound.color} />
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
    <TextArea bind:value={updatedRound.description} placeholder="My RPGF round" resizable />
  </FormField>
</RpgfSettingsForm>

<style>
  .url-input {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
</style>
