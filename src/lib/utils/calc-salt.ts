import { ethers } from 'ethers';

export default function calculateRandomSalt() {
  const randomBytes = ethers.randomBytes(32);
  return BigInt(ethers.hexlify(randomBytes)) & BigInt('0xFFFFFFFFFFFFFFFF');
}
