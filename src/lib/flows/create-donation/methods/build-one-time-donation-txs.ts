import type { Address } from 'viem';
import tokensStore from '$lib/stores/tokens/tokens.store';
import network from '$lib/stores/wallet/network';
import { populateErc20WriteTx } from '$lib/utils/sdk/erc20/erc20';
import type { OxString } from '$lib/utils/sdk/sdk-types';
import type { TransactionWrapper } from '$lib/components/stepper/types';
import { sdkManager } from '$lib/utils/sdk/sdk-manager';
import type {
  SdkEcosystemMainAccountReceiver,
  SdkReceiver,
  SdkProjectReceiver,
  SdkAddressReceiver,
  SdkDripListReceiver,
  SdkOrcidReceiver,
} from '@drips-network/sdk';
import type {
  CreateDonationDetailsStepAddressDriverAccountFragment,
  CreateDonationDetailsStepNftDriverAccountFragment,
  CreateDonationDetailsStepProjectFragment,
  CreateDonationDetailsStepEcosystemFragment,
  CreateDonationDetailsStepOrcidFragment,
} from '../__generated__/gql.generated';

// TODO: integrate into SDK
type SdkOrcidReceiver = {
    type: 'orcid-account';
    accountId: bigint;
};

const WAITING_WALLET_ICON = {
  component: 'Emoji',
  props: {
    emoji: '👛',
    size: 'huge',
  },
};

function isTokenApprovalRequired(tokenAllowance: bigint, requiredAmount: bigint): boolean {
  return tokenAllowance < requiredAmount;
}

async function buildTokenApprovalTx(tokenAddress: string, amount: bigint) {
  return await populateErc20WriteTx({
    token: tokenAddress as OxString,
    functionName: 'approve',
    args: [network.contracts.ADDRESS_DRIVER as OxString, amount],
  });
}

function transformReceiverToSdkReceiver(
  receiver:
    | CreateDonationDetailsStepAddressDriverAccountFragment
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment
    | CreateDonationDetailsStepEcosystemFragment
    | CreateDonationDetailsStepOrcidFragment,
): SdkReceiver {
  switch (receiver.__typename) {
    case 'AddressDriverAccount':
      return {
        type: 'address',
        address: receiver.address as `0x${string}`,
      } as SdkAddressReceiver;

    case 'NftDriverAccount':
      return {
        type: 'drip-list',
        accountId: BigInt(receiver.accountId),
      } as SdkDripListReceiver;

    case 'Project':
      return {
        type: 'project',
        url: receiver.source.url,
      } as SdkProjectReceiver;

    case 'EcosystemMainAccount':
      return {
        type: 'ecosystem-main-account',
        accountId: BigInt(receiver.account.accountId),
      } as SdkEcosystemMainAccountReceiver;

    case 'OrcidLinkedIdentity':
      return {
        type: 'orcid',
        orcidId: receiver.orcid,
      } as SdkOrcidReceiver;

    default:
      throw new Error(`Unsupported receiver type: ${(receiver as any).__typename}`); // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

export interface OneTimeDonationContext {
  tokenAddress: string;
  amount: bigint;
  amountInputValue: string;
  tokenAllowance: bigint;
  receiver:
    | CreateDonationDetailsStepAddressDriverAccountFragment
    | CreateDonationDetailsStepNftDriverAccountFragment
    | CreateDonationDetailsStepProjectFragment
    | CreateDonationDetailsStepEcosystemFragment
    | CreateDonationDetailsStepOrcidFragment;
}

export async function buildOneTimeDonationTxs(context: OneTimeDonationContext) {
  const sdk = sdkManager.sdk;
  if (!sdk) throw new Error('SDK not initialized');

  const { tokenAddress, amount, amountInputValue, tokenAllowance, receiver } = context;
  const token = tokensStore.getByAddress(tokenAddress);
  if (!token) throw new Error('Token not found');

  const needsApproval = isTokenApprovalRequired(tokenAllowance, amount);
  const sdkReceiver = transformReceiverToSdkReceiver(receiver);

  const oneTimeDonationTx = await sdk.donations.prepareOneTime({
    amount: String(amountInputValue),
    erc20: tokenAddress as Address,
    tokenDecimals: token.info.decimals,
    receiver: sdkReceiver as SdkReceiver,
  });

  const txs = [
    ...(needsApproval
      ? [
          {
            title: `Approve Drips to withdraw ${token.info.symbol}`,
            transaction: await buildTokenApprovalTx(tokenAddress, amount),
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
      title: 'Making one-time donation',
      transaction: oneTimeDonationTx,
      applyGasBuffer: true,
    },
  ] as TransactionWrapper[];

  return { txs };
}
