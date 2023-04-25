import { ethers } from 'ethers';

type Driver = 'address' | 'nft' | 'immutableSplits' | 'git';

export default function inferDriver(userId: string): Driver {
  const userIdAsBn = ethers.BigNumber.from(userId);

  const driverId = userIdAsBn.shr(224).toNumber();

  switch (driverId) {
    case 0:
      return 'address';
    case 1:
      return 'nft';
    case 2:
      return 'immutableSplits';
    case 5:
      return 'git';
    default:
      throw new Error(`Invalid driverId: ${driverId}`);
  }
}
