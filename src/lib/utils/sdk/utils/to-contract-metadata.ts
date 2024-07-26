import { encodeBytes32String, hexlify, toUtf8Bytes } from 'ethers';
import type { OxString } from '../sdk-types';

export default function toContractMetadata({ key, value }: { key: string; value: string }): {
  key: OxString;
  value: OxString;
} {
  return {
    key: encodeBytes32String(key) as OxString,
    value: hexlify(toUtf8Bytes(value)) as OxString,
  };
}
