<script lang="ts">
  import { get, type Writable } from 'svelte/store';
  import type { CreateStreamFlowState } from './create-stream-flow-state';
  import { createEventDispatcher, onMount } from 'svelte';
  import type { StepComponentEvents } from '$lib/components/stepper/types';
  import { gql } from 'graphql-request';
  import walletStore from '$lib/stores/wallet/wallet.store';
  import assert from '$lib/utils/assert';
  import { CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT } from '../../utils/current-amounts';
  import query from '$lib/graphql/dripsQL';
  import type {
    TokenBalancesQuery,
    TokenBalancesQueryVariables,
  } from './__generated__/gql.generated';
  import filterCurrentChainData from '$lib/utils/filter-current-chain-data';
  import network from '$lib/stores/wallet/network';

  const dispatch = createEventDispatcher<StepComponentEvents>();

  export let context: Writable<CreateStreamFlowState>;

  onMount(() => {
    dispatch('await', {
      promise: async () => {
        const { address } = get(walletStore);
        assert(address);

        const tokensQuery = gql`
          ${CURRENT_AMOUNTS_USER_BALANCE_TIMELINE_ITEM_FRAGMENT}
          query TokenBalances($address: String!, $chains: [SupportedChain!]!) {
            userByAddress(address: $address, chains: $chains) {
              chainData {
                chain
                balances {
                  tokenAddress
                  outgoing {
                    ...CurrentAmountsUserBalanceTimelineItem
                  }
                }
              }
            }
          }
        `;

        const tokensQueryRes = await query<TokenBalancesQuery, TokenBalancesQueryVariables>(
          tokensQuery,
          { address, chains: [network.gqlName] },
        );

        const chainData = filterCurrentChainData(tokensQueryRes.userByAddress.chainData);

        $context.userOutgoingTokenBalances = chainData.balances;

        return {};
      },
      message: 'Getting ready…',
    });
  });
</script>
