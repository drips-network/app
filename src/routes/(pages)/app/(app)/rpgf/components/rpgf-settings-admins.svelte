<script lang="ts">
  import FormField from '$lib/components/form-field/form-field.svelte';
  import type { ComponentProps } from 'svelte';
  import RpgfSettingsForm from './rpgf-settings-form.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Items } from '$lib/components/list-editor/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ensureAtLeastOneArrayMember from '$lib/utils/ensure-at-least-one-array-member';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';

  export let settingsFormProps: Omit<ComponentProps<RpgfSettingsForm>, 'updatedRoundOrDraft'>;

  let updatedRoundOrDraft = { ...settingsFormProps.roundOrDraft };

  let adminItems: Items = Object.fromEntries(
    updatedRoundOrDraft.adminWalletAddresses.map((address) => {
      return [
        address,
        {
          type: 'address',
          address,
        },
      ];
    }),
  );

  $: {
    const addresses = mapFilterUndefined(
      Object.values(adminItems).map((item) => {
        if (item.type === 'address') {
          return item.address;
        } else {
          return undefined;
        }
      }),
      (v) => v,
    );

    if (ensureAtLeastOneArrayMember(addresses)) {
      updatedRoundOrDraft = {
        ...updatedRoundOrDraft,
        adminWalletAddresses: addresses,
      };
    }
  }

  $: ownAddress = $walletStore.address?.toLowerCase();
</script>

<RpgfSettingsForm {...settingsFormProps} bind:updatedRoundOrDraft>
  <FormField title="Administrators">
    <ListEditor
      bind:items={adminItems}
      allowDripLists={false}
      allowProjects={false}
      weightsMode={false}
      protectedItems={ownAddress ? [ownAddress] : []}
    />
  </FormField>
</RpgfSettingsForm>
