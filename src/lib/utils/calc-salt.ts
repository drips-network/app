import { ethers } from 'ethers';

export default function calculateSaltFromAddress(seedConstant: string, address: string) {
  const hash = ethers.keccak256(
    ethers.AbiCoder.defaultAbiCoder().encode(['string'], [seedConstant + address]),
  );
  const randomBigInt = ethers.toBigInt('0x' + hash.slice(26));

  return BigInt(randomBigInt.toString()) & BigInt('0xFFFFFFFFFFFFFFFF');
}
