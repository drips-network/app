import { extractDriverNameFromAccountId } from './extract-driver-from-accountId';

export type AddressDriverId = string;

export default function isAddressDriverId(idAsString: string): idAsString is AddressDriverId {
  const isNaN = Number.isNaN(Number(idAsString));

  const isAccountIdOfAddressDriver = extractDriverNameFromAccountId(idAsString) === 'addressDriver';

  if (isNaN || !isAccountIdOfAddressDriver) {
    return false;
  }

  return true;
}
