import { AddressDriverClient, Utils } from 'radicle-drips';
import type { AddressDriverUser, NFTDriverUser, UserId } from '../types';

export default function buildStreamReceiver(
  receiverUserId: UserId,
): AddressDriverUser | NFTDriverUser {
  const receiverDriver = Utils.UserId.getDriver(receiverUserId);

  switch (receiverDriver) {
    case 'address':
      return {
        driver: 'address',
        address: AddressDriverClient.getUserAddress(receiverUserId),
        userId: receiverUserId,
      };
    case 'nft':
      return {
        driver: 'nft',
        userId: receiverUserId,
      };
    default:
      throw new Error(`Unsupported stream receiver driver type: ${receiverDriver}`);
  }
}
