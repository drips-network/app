import { ethers } from 'ethers';

export default function calculateSaltFromAddress(seedConstant: string, address: string) {
  const hash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(['string'], [seedConstant + address]),
  );
  const addressBigInt = ethers.toBigInt('0x' + hash.slice(26));

  const randomBytes = ethers.randomBytes(32);
  const randomBigInt = BigInt(ethers.hexlify(randomBytes));

  return addressBigInt & randomBigInt & BigInt('0xFFFFFFFFFFFFFFFF');
}
