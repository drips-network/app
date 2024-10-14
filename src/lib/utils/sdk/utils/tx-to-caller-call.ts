import { toBigInt, type ContractTransaction } from 'ethers';
import type { CallerCall, OxString } from '../sdk-types';

export default function txToCallerCall(tx: ContractTransaction): CallerCall {
  return {
    target: tx.to as OxString,
    data: tx.data as OxString,
    value: toBigInt(tx.value ?? 0),
  };
}
