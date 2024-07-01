<script lang="ts">
  import { get, type Writable } from 'svelte/store';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { gql } from 'graphql-request';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import query from '$lib/graphql/dripsQL';
  import { WITHDRAW_FLOW_ENTER_AMOUNT_STEP_BALANCES_FRAGMENT } from './enter-amount.svelte';
  import type { WithdrawFlowState } from './withdraw-flow-state';
  import type {
    TokenBalancesQuery,
    TokenBalancesQueryVariables,
  } from './__generated__/gql.generated';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<WithdrawFlowState>;

  onMount(() => {
    dispatch('await', {
      promise: async () => {
        const { address } = get(walletStore);
        assert(address);

        const tokensQuery = gql`
          ${WITHDRAW_FLOW_ENTER_AMOUNT_STEP_BALANCES_FRAGMENT}
          query TokenBalances($address: String!) {
            userByAddress(address: $address) {
              balances {
                ...WithdrawFlowEnterAmountStepBalances
              }
            }
          }
        `;

        const tokensQueryRes = await query<TokenBalancesQuery, TokenBalancesQueryVariables>(
          tokensQuery,
          { address },
        );

        $context.userOutgoingTokenBalances = tokensQueryRes.userByAddress.balances;

        return {};
      },
      message: 'Getting ready…',
    });
  });
</script>
