<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import TextArea from '$lib/components/text-area/text-area.svelte';
  import TextInput from '$lib/components/text-input/text-input.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';
  import type { TextInputValidationState } from '$lib/components/text-input/text-input';
  import { z } from 'zod';
  import { checkSlugAvailability } from '$lib/utils/rpgf/rpgf';
  import network from '$lib/stores/wallet/network';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };

  let urlSlugInputValue = updatedRoundOrDraft.urlSlug;
  let urlSlugValidationState: TextInputValidationState = { type: 'unvalidated' };

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
    urlSlugValidationState = { type: 'unvalidated' };
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

  $: valid = Boolean(
    urlSlugValidationState.type === 'valid' &&
      updatedRoundOrDraft.name &&
      updatedRoundOrDraft.name.length > 0,
  );

  let showUrlSuccess = false;
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft invalid={!valid}>
  <FormField title="Round name*">
    <TextInput bind:value={updatedRoundOrDraft.name} placeholder="My RPGF round" />
  </FormField>

  <FormField title="URL*" disabled={urlSlugValidationState.type === 'pending'}>
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
