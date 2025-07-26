import { get } from 'svelte/store';
import { TimeUnit, type SdkSplitsReceiver } from '@drips-network/sdk';
import type { Address } from 'viem';
import { MaxUint256 } from 'ethers';
import tokensStore from '$lib/stores/tokens/tokens.store';
import network from '$lib/stores/wallet/network';
import { getAddressDriverAllowance } from '$lib/utils/sdk/address-driver/address-driver';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import unreachable from '$lib/utils/unreachable';
import type { State } from '$lib/flows/create-drip-list-flow/create-drip-list-flow';
import type { Items, Weights } from '$lib/components/list-editor/types';
import assert from '$lib/utils/assert';
import type { TransactionWrapper } from '$lib/components/stepper/types';
import sdkStore from '$lib/stores/sdk/sdk.store';

const WAITING_WALLET_ICON = {
  component: 'Emoji',
  props: {
    emoji: '👛',
    size: 'huge',
  },
};

async function isTokenApprovalRequired(
  tokenAddress: string,
  requiredAmount: bigint,
): Promise<boolean> {
  const currentAllowance = await getAddressDriverAllowance(tokenAddress as OxString);
  return currentAllowance < requiredAmount;
}

async function buildTokenApprovalTx(tokenAddress: string) {
  return await populateErc20WriteTx({
    token: tokenAddress as OxString,
    functionName: 'approve',
    args: [network.contracts.ADDRESS_DRIVER as OxString, MaxUint256],
  });
}

async function transformItemsToSdkReceivers(
  weights: Weights,
  items: Items,
): Promise<SdkSplitsReceiver[]> {
  const receivers: SdkSplitsReceiver[] = [];

  for (const [accountId, weight] of Object.entries(weights)) {
    assert(weight > 0n, 'Cannot transform item to SDK receiver: weight must be greater than 0');

    const item = items[accountId];

    switch (item.type) {
      case 'address':
        receivers.push({
          type: 'address',
          address: item.address as Address,
          weight,
        });
        break;

      case 'project':
        receivers.push({
          type: 'project',
          url: item.project.source.url,
          weight,
        });
        break;

      case 'drip-list':
        receivers.push({
          type: 'drip-list',
          accountId: BigInt(item.dripList.account.accountId),
          weight,
        });
        break;
    }
  }

  return receivers;
}

export async function buildDripListCreationTxs(context: State) {
  const sdk = get(sdkStore).sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const prepareDripListCreationResult = await sdk.dripLists.prepareCreate({
    isVisible: true,
    name: context.dripList.title,
    description: context.dripList.description,
    receivers: await transformItemsToSdkReceivers(context.dripList.weights, context.dripList.items),
  });

  let donationTx: TransactionWrapper | undefined = undefined;
  let approvalTokenAddress: string | undefined;

  if (context.selectedSupportOption === 1) {
    // Continuous Support
    const tokenAddress = context.continuousSupportConfig.listSelected[0] ?? unreachable();
    const token = tokensStore.getByAddress(tokenAddress) ?? unreachable();

    const needsApproval = await isTokenApprovalRequired(
      tokenAddress,
      context.continuousSupportConfig.topUpAmountValueParsed || unreachable(), // In parsed format.
    );

    if (needsApproval) {
      approvalTokenAddress = tokenAddress;
    }

    const { preparedTx: prepareContinuousDonationTx } = await sdk.donations.prepareContinuous({
      erc20: tokenAddress as Address,
      amount: context.continuousSupportConfig.streamRateValue ?? '0',
      timeUnit: TimeUnit.MONTH,
      tokenDecimals: token.info.decimals,
      receiver: { type: 'drip-list', accountId: prepareDripListCreationResult.dripListId },
      topUpAmount: context.continuousSupportConfig.topUpAmountValue ?? '0',
    });

    donationTx = {
      title: 'Setting up continuous support',
      transaction: prepareContinuousDonationTx,
      applyGasBuffer: true,
    };
  } else if (context.selectedSupportOption === 2) {
    // One-time Donation
    const tokenAddress = context.oneTimeDonationConfig.selectedTokenAddress?.[0] ?? unreachable();
    const token = tokensStore.getByAddress(tokenAddress) ?? unreachable();

    const needsApproval = await isTokenApprovalRequired(
      tokenAddress,
      context.oneTimeDonationConfig.amount || unreachable(), // In parsed format.
    );

    if (needsApproval) {
      approvalTokenAddress = tokenAddress;
    }

    const oneTimeDonationTx = await sdk.donations.prepareOneTime({
      amount: context.oneTimeDonationConfig.amountInputValue ?? unreachable(),
      erc20: tokenAddress as Address,
      tokenDecimals: token.info.decimals,
      receiver: { type: 'drip-list', accountId: prepareDripListCreationResult.dripListId },
    });

    donationTx = {
      title: 'Making one-time donation',
      transaction: oneTimeDonationTx,
      applyGasBuffer: true,
    };
  }

  const txs = [
    ...(approvalTokenAddress
      ? [
          {
            title: `Approve Drips to withdraw ${approvalTokenAddress}`,
            transaction: await buildTokenApprovalTx(approvalTokenAddress),
            waitingSignatureMessage: {
              message: `Waiting for you to approve Drips access to the ERC-20 token in your wallet...`,
              subtitle: 'You only have to do this once per token.',
              icon: WAITING_WALLET_ICON,
            },
            applyGasBuffer: false,
          },
        ]
      : []),
    {
      title: 'Creating the Drip List',
      transaction: prepareDripListCreationResult.preparedTx,
      applyGasBuffer: true,
    },
    donationTx,
  ].filter(Boolean) as TransactionWrapper[];

  return {
    txs: txs,
    dripListId: prepareDripListCreationResult.dripListId.toString(),
  };
}
