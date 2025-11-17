<script lang="ts">
  import { run } from 'svelte/legacy';

  import FormField from '$lib/components/form-field/form-field.svelte';
  import ListEditor from '$lib/components/list-editor/list-editor.svelte';
  import type { Items } from '$lib/components/list-editor/types';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import ensureAtLeastOneArrayMember from '$lib/utils/ensure-at-least-one-array-member';
  import mapFilterUndefined from '$lib/utils/map-filter-undefined';
  import { getAddress } from 'ethers';
  import RpgfSettingsForm from '../../../../components/rpgf-settings-form.svelte';
  import { setRoundAdmins } from '$lib/utils/rpgf/rpgf';
  import { areStringArraysEqual } from '$lib/utils/compare-string-array';

  let { data } = $props();

  let updatedAdminAddresses: string[] = $state([
    ...data.roundAdmins.map((u) => getAddress(u.walletAddress)),
  ]);

  // TODO(rpgf): use address driver account IDs as item keys, not addresses
  let adminItems: Items = $state(
    Object.fromEntries(
      data.roundAdmins.map((u) => {
        return [
          getAddress(u.walletAddress),
          {
            type: 'address',
            address: getAddress(u.walletAddress),
          },
        ];
      }),
    ),
  );

  run(() => {
    if (adminItems) {
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
        updatedAdminAddresses = [...addresses.map((a) => getAddress(a))];
      }
    }
  });

  let ownAddress = $derived($walletStore.address?.toLowerCase());

  let changesMade = $state(false);

  run(() => {
    changesMade = !areStringArraysEqual(
      updatedAdminAddresses.map((a) => a.toLowerCase()).sort(),
      data.roundAdmins.map((u) => u.walletAddress.toLowerCase()).sort(),
    );
  });

  async function saveHandler() {
    await setRoundAdmins(undefined, data.round.id, updatedAdminAddresses);
  }
</script>

<RpgfSettingsForm saveEnabled={changesMade} {saveHandler}>
  <FormField
    title="Administrators"
    description="Administrators can edit round settings, see full applications including private data, review pending applications, and export vote data."
  >
    <ListEditor
      bind:items={adminItems}
      allowDripLists={false}
      allowProjects={false}
      weightsMode={false}
      protectedItems={ownAddress ? [ownAddress] : []}
    />
  </FormField>
</RpgfSettingsForm>
