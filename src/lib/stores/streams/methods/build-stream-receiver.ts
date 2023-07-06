import { AddressDriverClient, Utils } from 'radicle-drips';
import type { AddressDriverAccount, NFTDriverAccount, AccountId } from '../types';

export default function buildStreamReceiver(
  receiverAccountId: AccountId,
): AddressDriverAccount | NFTDriverAccount {
  const receiverDriver = Utils.AccountId.getDriver(receiverAccountId);

  switch (receiverDriver) {
    case 'address':
      return {
        driver: 'address',
        address: AddressDriverClient.getUserAddress(receiverAccountId),
        accountId: receiverAccountId,
      };
    case 'nft':
      return {
        driver: 'nft',
        accountId: receiverAccountId,
      };
    default:
      throw new Error(`Unsupported stream receiver driver type: ${receiverDriver}`);
  }
}
